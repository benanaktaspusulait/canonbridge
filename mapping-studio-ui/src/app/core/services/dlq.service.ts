import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DlqMessage {
  id: string;
  originalTopic: string;
  partition?: number;
  offset?: number;
  key?: string;
  payload: string;
  errorMessage?: string;
  errorStackTrace?: string;
  failedAt: string;
  retryCount: number;
  status: 'FAILED' | 'REDRIVING' | 'REDRIVEN' | 'PERMANENTLY_FAILED';
  redriveAttemptedAt?: string;
}

export interface DlqStats {
  total: number;
  failed: number;
  redriving: number;
  redriven: number;
  permanentlyFailed: number;
}

@Injectable({
  providedIn: 'root'
})
export class DlqService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.api.baseUrl}/dlq`;

  /**
   * List all DLQ messages with pagination
   */
  listMessages(limit: number = 50, offset: number = 0): Observable<DlqMessage[]> {
    return this.http.get<DlqMessage[]>(`${this.baseUrl}`, {
      params: { limit: limit.toString(), offset: offset.toString() }
    });
  }

  /**
   * Get a specific DLQ message by ID
   */
  getMessage(id: string): Observable<DlqMessage> {
    return this.http.get<DlqMessage>(`${this.baseUrl}/${id}`);
  }

  /**
   * Redrive a failed message (retry processing)
   */
  redriveMessage(id: string): Observable<{ message: string; id: string }> {
    return this.http.post<{ message: string; id: string }>(`${this.baseUrl}/${id}/redrive`, {});
  }

  /**
   * Get DLQ statistics
   */
  getStats(): Observable<DlqStats> {
    return this.http.get<DlqStats>(`${this.baseUrl}/stats`);
  }
}
