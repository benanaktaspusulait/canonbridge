import jsonata from 'jsonata';

export type JsonataCheckOk = { ok: true; result: unknown };
export type JsonataCheckErr = { ok: false; stage: 'compile' | 'evaluate'; message: string };

const DEFAULT_TIMEOUT_MS = 500;
const MAX_PAYLOAD_BYTES = 2_000_000;
const MAX_EXPRESSION_LENGTH = 500_000;

/** Hard cap enforced at HTTP layer — exported for reuse in validators. */
export const JSONATA_BATCH_MAX_ITEMS = 64;

/**
 * [T-V1-H2] JSONata function allow-list.
 *
 * Instead of a regex blocklist (trivially bypassed), we restrict the JSONata
 * evaluation environment by NOT registering any dangerous custom bindings.
 * The default JSONata 2.x runtime does not expose $eval, $fetch, $http, $exec,
 * $readFile, $writeFile, $spawn, $import, or $require — so the attack surface
 * is limited to CPU exhaustion (mitigated by timeouts and worker pool).
 *
 * If custom functions are ever registered, they MUST be added to an explicit
 * allow-list here rather than relying on a blocklist.
 */

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
    // [T-V1-H2] Evaluate with empty bindings — no custom functions exposed.
    // This is the proper security boundary: JSONata's default environment has
    // no I/O functions. Any future custom bindings must be explicitly registered.
    const evalPromise = expr.evaluate(payload, {}) as Promise<unknown>;
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
