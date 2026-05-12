/**
 * G-16: Worker thread for JSONata evaluation
 * 
 * This worker receives evaluation tasks from the main thread,
 * executes them, and returns results.
 */

import { parentPort } from 'node:worker_threads';
import jsonata from 'jsonata';

interface EvaluationTask {
  expression: string;
  input: unknown;
}

interface EvaluationResult {
  ok: boolean;
  result?: unknown;
  error?: string;
}

if (!parentPort) {
  throw new Error('This module must be run as a worker thread');
}

parentPort.on('message', async (task: EvaluationTask) => {
  try {
    const expression = jsonata(task.expression);
    const result = await expression.evaluate(task.input);
    
    const response: EvaluationResult = { ok: true, result };
    parentPort!.postMessage(response);
  } catch (err) {
    const response: EvaluationResult = {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
    parentPort!.postMessage(response);
  }
});
