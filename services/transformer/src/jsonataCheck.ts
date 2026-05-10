import jsonata from 'jsonata';

export type JsonataCheckOk = { ok: true; result: unknown };
export type JsonataCheckErr = { ok: false; stage: 'compile' | 'evaluate'; message: string };

const DEFAULT_TIMEOUT_MS = 500;
const MAX_PAYLOAD_BYTES = 2_000_000;
const MAX_EXPRESSION_LENGTH = 500_000;

/** Hard cap enforced at HTTP layer — exported for reuse in validators. */
export const JSONATA_BATCH_MAX_ITEMS = 64;

function payloadByteSize(payload: unknown): number {
  try {
    return new TextEncoder().encode(JSON.stringify(payload)).length;
  } catch {
    return MAX_PAYLOAD_BYTES + 1;
  }
}

export async function checkJsonataExpression(
  expression: string,
  payload: unknown,
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
): Promise<JsonataCheckOk | JsonataCheckErr> {
  if (expression.length > MAX_EXPRESSION_LENGTH) {
    return { ok: false, stage: 'compile', message: 'Expression exceeds maximum length' };
  }
  if (payloadByteSize(payload) > MAX_PAYLOAD_BYTES) {
    return { ok: false, stage: 'evaluate', message: 'Payload exceeds maximum size for JSONata check' };
  }

  let expr;
  try {
    expr = jsonata(expression);
  } catch (err) {
    return {
      ok: false,
      stage: 'compile',
      message: err instanceof Error ? err.message : String(err),
    };
  }

  try {
    const evalPromise = expr.evaluate(payload) as Promise<unknown>;
    const result = await Promise.race([
      evalPromise,
      new Promise<never>((_, rej) => {
        setTimeout(() => rej(new Error(`Evaluation timed out after ${timeoutMs}ms`)), timeoutMs);
      }),
    ]);
    return { ok: true as const, result: result === undefined ? null : result };
  } catch (err) {
    return {
      ok: false,
      stage: 'evaluate',
      message: err instanceof Error ? err.message : String(err),
    };
  }
}

export type JsonataBatchItem = { ruleId: string; expression: string };

export async function checkJsonataBatch(
  payload: unknown,
  items: JsonataBatchItem[],
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
): Promise<Record<string, JsonataCheckOk | JsonataCheckErr>> {
  if (payloadByteSize(payload) > MAX_PAYLOAD_BYTES) {
    const err: JsonataCheckErr = {
      ok: false,
      stage: 'evaluate',
      message: 'Payload exceeds maximum size for JSONata check',
    };
    return Object.fromEntries(items.map(i => [i.ruleId, err]));
  }

  const out: Record<string, JsonataCheckOk | JsonataCheckErr> = {};
  await Promise.all(
    items.map(async item => {
      const trimmed = item.expression.trim();
      if (!trimmed) {
        out[item.ruleId] = {
          ok: false,
          stage: 'compile',
          message: 'Empty expression',
        };
        return;
      }
      out[item.ruleId] = await checkJsonataExpression(trimmed, payload, timeoutMs);
    }),
  );
  return out;
}
