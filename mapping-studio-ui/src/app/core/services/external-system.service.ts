import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface OutboundConnection {
  connection_id?: string;
  tenant_id?: string;
  draft_id?: string;
  name: string;
  purpose?: 'SOURCE_PAYLOAD' | 'ENRICHMENT' | 'DESTINATION' | 'MANUAL_TEST';
  protocol: 'REST' | 'SOAP' | 'GRAPHQL' | 'GRPC';
  method: string;
  url: string;
  credential_id?: string;
  environment: 'PRODUCTION' | 'SANDBOX';
  schedule?: string;
  timeout_ms?: number;
  retry_policy?: any;
  response_handling?: any;
  status?: 'NOT_TESTED' | 'HEALTHY' | 'DEGRADED' | 'FAILED' | 'DISABLED';
  last_test_at?: string;
  last_test_result?: string;
  created_at?: string;
  updated_at?: string;
  // New fields for system templates
  is_system_template?: boolean;
  base_url?: string;
  known_endpoints?: Array<{
    path: string;
    method: string;
    description: string;
  }>;
}

export interface TestRequest {
  headers?: Record<string, string>;
  payload?: Record<string, unknown> | null;
}

export interface TestResult {
  success: boolean;
  statusCode?: number;
  durationMs?: number;
  body?: string;
  responseBody?: string;
  errorMessage?: string;
}

export interface AdhocTestRequest {
  connection: OutboundConnection;
  request: TestRequest;
}

@Injectable({
  providedIn: 'root'
})
export class ExternalSystemService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.api.baseUrl}/external-systems`;

  list(): Observable<OutboundConnection[]> {
    return this.http.get<OutboundConnection[]>(this.baseUrl);
  }

  getById(id: string): Observable<OutboundConnection> {
    return this.http.get<OutboundConnection>(`${this.baseUrl}/${id}`);
  }

  listByDraft(draftId: string): Observable<OutboundConnection[]> {
    return this.http.get<OutboundConnection[]>(`${this.baseUrl}/draft/${draftId}`);
  }

  create(connection: OutboundConnection): Observable<OutboundConnection> {
    return this.http.post<OutboundConnection>(this.baseUrl, connection);
  }

  update(id: string, connection: OutboundConnection): Observable<OutboundConnection> {
    return this.http.put<OutboundConnection>(`${this.baseUrl}/${id}`, connection);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  test(id: string, request: TestRequest): Observable<TestResult> {
    return this.http.post<TestResult>(`${this.baseUrl}/${id}/test`, request);
  }

  testAdhoc(request: AdhocTestRequest): Observable<TestResult> {
    return this.http.post<TestResult>(`${this.baseUrl}/test-adhoc`, request);
  }
}
