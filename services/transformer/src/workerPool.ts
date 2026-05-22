/**
 * G-16: Worker thread pool for CPU-intensive JSONata evaluations
 * 
 * ADR-006: Worker Pool CPU Isolation
 * - Prevents event loop blocking during heavy transformations
 * - Configurable pool size (default: CPU count - 1)
 * - Graceful shutdown support
 */

import { Worker } from 'node:worker_threads';
import { cpus } from 'node:os';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { existsSync } from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface EvaluationTask {
  expression: string;
  input: unknown;
}

export interface EvaluationResult {
  ok: boolean;
  result?: unknown;
  error?: string;
}

interface PendingTask {
  task: EvaluationTask;
  timeoutMs: number;
  resolve: (result: EvaluationResult) => void;
  reject: (error: Error) => void;
}

export class WorkerPool {
  private workers: Worker[] = [];
  private availableWorkers: Worker[] = [];
  private taskQueue: PendingTask[] = [];
  private shuttingDown = false;
  private nextWorkerId = 0;
  // [T-V1-M2] Cap queue length to prevent OOM under sustained load
  private readonly maxQueueLength: number;

  constructor(private readonly poolSize: number = Math.max(1, cpus().length - 1)) {
    this.maxQueueLength = 2 * this.poolSize;
  }

  async start(): Promise<void> {
    if (this.workers.length > 0) return;

    for (let i = 0; i < this.poolSize; i++) {
      this.addWorker();
    }
  }

  async evaluate(
    expression: string,
    input: unknown,
    timeoutMs = 5000,
  ): Promise<EvaluationResult> {
    if (this.shuttingDown) {
      return { ok: false, error: 'Worker pool is shutting down' };
    }

    // [T-V1-M2] Reject when queue is full to surface back-pressure
    if (this.availableWorkers.length === 0 && this.taskQueue.length >= this.maxQueueLength) {
      return { ok: false, error: 'Worker pool queue full — back-pressure (503)' };
    }

    return new Promise((resolve, reject) => {
      const task: PendingTask = {
        task: { expression, input },
        timeoutMs,
        resolve,
        reject,
      };

      const worker = this.availableWorkers.pop();
      if (worker) {
        this.executeTask(worker, task);
      } else {
        this.taskQueue.push(task);
      }
    });
  }

  private addWorker(): Worker {
    const workerId = this.nextWorkerId++;
    const compiledWorkerScript = path.join(__dirname, 'jsonataWorker.js');
    const sourceWorkerScript = path.join(__dirname, 'jsonataWorker.ts');
    const workerScript = existsSync(compiledWorkerScript) ? compiledWorkerScript : sourceWorkerScript;

    // [T-V1-L7] Fail fast in production if compiled worker is missing
    if (workerScript.endsWith('.ts') && process.env.NODE_ENV === 'production') {
      throw new Error(
        `Compiled worker script not found at ${compiledWorkerScript} — cannot use tsx in production`,
      );
    }

    const workerOptions = workerScript.endsWith('.ts') ? { execArgv: ['--import', 'tsx'] } : undefined;
    const worker = new Worker(workerScript, workerOptions);

    worker.on('error', (err) => {
      console.error(`Worker ${workerId} error:`, err);
      this.removeWorker(worker);
    });

    worker.on('exit', (code) => {
      this.removeWorker(worker);
      if (code !== 0 && !this.shuttingDown) {
        console.error(`Worker ${workerId} exited with code ${code}`);
      }
    });

    this.workers.push(worker);
    this.availableWorkers.push(worker);
    return worker;
  }

  private removeWorker(worker: Worker): void {
    this.workers = this.workers.filter(w => w !== worker);
    this.availableWorkers = this.availableWorkers.filter(w => w !== worker);
  }

  private executeTask(worker: Worker, pending: PendingTask): void {
    let settled = false;
    const cleanup = () => {
      worker.off('message', messageHandler);
      worker.off('error', errorHandler);
      clearTimeout(timeoutHandle);
    };

    const timeoutHandle = setTimeout(() => {
      if (settled) return;
      settled = true;
      cleanup();
      this.removeWorker(worker);
      pending.resolve({ ok: false, error: `Worker evaluation timed out after ${pending.timeoutMs}ms` });
      worker.terminate()
        .catch((err) => console.error('Failed to terminate timed-out worker:', err))
        .finally(() => {
          if (!this.shuttingDown) {
            this.addWorker();
            this.drainQueue();
          }
        });
    }, pending.timeoutMs);

    const messageHandler = (result: EvaluationResult) => {
      if (settled) return;
      settled = true;
      cleanup();
      
      // Process next queued task if any
      const nextTask = this.taskQueue.shift();
      if (nextTask) {
        this.executeTask(worker, nextTask);
      } else if (!this.shuttingDown) {
        this.availableWorkers.push(worker);
      }
      
      pending.resolve(result);
    };

    const errorHandler = (err: Error) => {
      if (settled) return;
      settled = true;
      cleanup();
      
      // Don't return worker to pool on error
      this.removeWorker(worker);
      pending.reject(err);
      if (!this.shuttingDown) {
        this.addWorker();
        this.drainQueue();
      }
    };

    worker.once('message', messageHandler);
    worker.once('error', errorHandler);
    worker.postMessage(pending.task);
  }

  private drainQueue(): void {
    while (!this.shuttingDown && this.availableWorkers.length > 0 && this.taskQueue.length > 0) {
      const worker = this.availableWorkers.pop();
      const task = this.taskQueue.shift();
      if (!worker || !task) return;
      this.executeTask(worker, task);
    }
  }

  async shutdown(): Promise<void> {
    this.shuttingDown = true;
    
    // Reject all queued tasks
    for (const pending of this.taskQueue) {
      pending.reject(new Error('Worker pool shutting down'));
    }
    this.taskQueue = [];

    // Terminate all workers
    await Promise.all(this.workers.map(w => w.terminate()));
    this.workers = [];
    this.availableWorkers = [];
  }

  get size(): number {
    return this.poolSize;
  }

  get available(): number {
    return this.availableWorkers.length;
  }

  get queueLength(): number {
    return this.taskQueue.length;
  }
}
