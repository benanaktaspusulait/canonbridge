import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface OutboundConnection {
  connectionId?: string;
  tenantId?: string;
  draftId?: string;
  name: string;
  purpose?: 'SOURCE_PAYLOAD' | 'ENRICHMENT' | 'DESTINATION' | 'MANUAL_TEST';
  protocol: 'REST' | 'SOAP' | 'GRAPHQL';
  method: string;
  url: string;
  credentialId?: string;
  environment: 'PRODUCTION' | 'SANDBOX';
  schedule?: string;
  timeoutMs?: number;
  retryPolicy?: any;
  responseHandling?: any;
  status?: 'NOT_TESTED' | 'HEALTHY' | 'DEGRADED' | 'FAILED' | 'DISABLED';
  lastTestAt?: string;
  lastTestResult?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TestRequest {
  headers?: Record<string, string>;
  body?: string;
  queryParams?: Record<string, string>;
}

export interface TestResult {
  success: boolean;
  statusCode: number;
  durationMs: number;
  responseBody?: string;
  errorMessage?: string;
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
}
