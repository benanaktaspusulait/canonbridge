import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface JsonataEvaluateResult {
  ok: boolean;
  result?: unknown;
  message?: string;
}

export type JsonataBatchExpression = { ruleId: string; expression: string };

export type JsonataBatchResultEntry =
  | { ok: true; result: unknown }
  | { ok: false; stage: string; message: string };

export interface JsonataBatchResponse {
  results: Record<string, JsonataBatchResultEntry>;
}

@Injectable({ providedIn: 'root' })
export class JsonataCheckService {
  private readonly http = inject(HttpClient);

  get isConfigured(): boolean {
    const u = environment.mapping.transformerApiUrl?.trim();
    return Boolean(u);
  }

  private baseUrl(): string | null {
    const u = environment.mapping.transformerApiUrl?.trim();
    return u ?? null;
  }

  /**
   * Returns null when transformer URL is not configured (checks are skipped).
   */
  async evaluate(
    payload: unknown,
    expression: string,
    timeoutMs = 500,
  ): Promise<JsonataEvaluateResult> {
    const base = environment.api.baseUrl.replace(/\/$/, '');
    const url = `${base}/jsonata/evaluate`;
    try {
      return await firstValueFrom(
        this.http.post<JsonataEvaluateResult>(url, { payload, expression, timeoutMs }),
      );
    } catch (e: any) {
      const message = e?.error?.message ?? e?.message ?? 'JSONata evaluation failed';
      return { ok: false, message };
    }
  }

  async checkBatch(
    payload: unknown,
    expressions: JsonataBatchExpression[],
    timeoutMs = 500,
  ): Promise<JsonataBatchResponse | null> {
    const base = this.baseUrl();
    if (!base || expressions.length === 0) {
      return null;
    }
    const url = `${base.replace(/\/$/, '')}/v1/jsonata/check-batch`;
    return firstValueFrom(
      this.http.post<JsonataBatchResponse>(url, { payload, expressions, timeoutMs }),
    );
  }
}
