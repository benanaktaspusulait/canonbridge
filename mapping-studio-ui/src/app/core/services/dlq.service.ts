import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DlqMessage {
  id: string;
  originalTopic: string;
  partition: number;
  offset: number;
  key?: string;
  payload: string;
  errorMessage: string;
  errorStackTrace?: string;
  failedAt: string;
  retryCount: number;
  status: 'FAILED' | 'REDRIVING' | 'REDRIVEN' | 'PERMANENTLY_FAILED';
  redriveAttemptedAt?: string;
}

export interface DlqStats {
  total: number;
  pending: number;
  redriven: number;
  discarded: number;
}

@Injectable({
  providedIn: 'root'
})
export class DlqService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.api.baseUrl}/dlq`;

  list(limit: number = 50, offset: number = 0): Observable<DlqMessage[]> {
    const params = new HttpParams()
      .set('limit', limit.toString())
      .set('offset', offset.toString());
    return this.http.get<DlqMessage[]>(this.baseUrl, { params });
  }

  // Alias for backward compatibility
  listMessages(limit: number = 50, offset: number = 0): Observable<DlqMessage[]> {
    return this.list(limit, offset);
  }

  getById(id: string): Observable<DlqMessage> {
    return this.http.get<DlqMessage>(`${this.baseUrl}/${id}`);
  }

  redrive(id: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${id}/redrive`, {});
  }

  // Alias for backward compatibility
  redriveMessage(id: string): Observable<void> {
    return this.redrive(id);
  }

  discard(id: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${id}/discard`, {});
  }

  bulkRedrive(ids: string[]): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/bulk-redrive`, { ids });
  }

  bulkDiscard(ids: string[]): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/bulk-discard`, { ids });
  }

  getStats(): Observable<DlqStats> {
    return this.http.get<DlqStats>(`${this.baseUrl}/stats`);
  }
}
