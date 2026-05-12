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
  resolve: (result: EvaluationResult) => void;
  reject: (error: Error) => void;
}

export class WorkerPool {
  private workers: Worker[] = [];
  private availableWorkers: Worker[] = [];
  private taskQueue: PendingTask[] = [];
  private shuttingDown = false;

  constructor(private readonly poolSize: number = Math.max(1, cpus().length - 1)) {}

  async start(): Promise<void> {
    if (this.workers.length > 0) return;

    const compiledWorkerScript = path.join(__dirname, 'jsonataWorker.js');
    const sourceWorkerScript = path.join(__dirname, 'jsonataWorker.ts');
    const workerScript = existsSync(compiledWorkerScript) ? compiledWorkerScript : sourceWorkerScript;
    const workerOptions = workerScript.endsWith('.ts') ? { execArgv: ['--import', 'tsx'] } : undefined;
    
    for (let i = 0; i < this.poolSize; i++) {
      const worker = new Worker(workerScript, workerOptions);
      
      worker.on('error', (err) => {
        console.error(`Worker ${i} error:`, err);
        // Remove from available pool
        this.availableWorkers = this.availableWorkers.filter(w => w !== worker);
      });

      worker.on('exit', (code) => {
        this.workers = this.workers.filter(w => w !== worker);
        this.availableWorkers = this.availableWorkers.filter(w => w !== worker);
        if (code !== 0 && !this.shuttingDown) {
          console.error(`Worker ${i} exited with code ${code}`);
        }
      });

      this.workers.push(worker);
      this.availableWorkers.push(worker);
    }
  }

  async evaluate(expression: string, input: unknown): Promise<EvaluationResult> {
    if (this.shuttingDown) {
      return { ok: false, error: 'Worker pool is shutting down' };
    }

    return new Promise((resolve, reject) => {
      const task: PendingTask = {
        task: { expression, input },
        resolve,
        reject,
      };

      const worker = this.availableWorkers.pop();
      if (worker) {
        this.executeTask(worker, task);
      } else {
        // All workers busy, queue the task
        this.taskQueue.push(task);
      }
    });
  }

  private executeTask(worker: Worker, pending: PendingTask): void {
    const messageHandler = (result: EvaluationResult) => {
      worker.off('message', messageHandler);
      worker.off('error', errorHandler);
      
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
      worker.off('message', messageHandler);
      worker.off('error', errorHandler);
      
      // Don't return worker to pool on error
      pending.reject(err);
    };

    worker.once('message', messageHandler);
    worker.once('error', errorHandler);
    worker.postMessage(pending.task);
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
