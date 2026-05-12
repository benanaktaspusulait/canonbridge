import { afterEach, describe, expect, it } from 'vitest';
import { loadEnv } from './env.js';

const ORIGINAL_ENV = { ...process.env };

describe('loadEnv', () => {
  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it('should keep worker pool disabled by default', () => {
    delete process.env.WORKER_POOL_ENABLED;

    expect(loadEnv().workerPoolEnabled).toBe(false);
  });

  it('should enable worker pool only when explicitly requested', () => {
    process.env.WORKER_POOL_ENABLED = 'true';

    expect(loadEnv().workerPoolEnabled).toBe(true);
  });
});

