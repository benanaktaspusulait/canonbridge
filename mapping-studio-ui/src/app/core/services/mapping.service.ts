import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface MappingDraft {
  id?: string;
  tenant_id?: string;
  partner_id?: string;
  event_type?: string;
  name: string;
  description?: string;
  source_type?:
    | 'KAFKA'
    | 'WEBHOOK'
    | 'REST_API'
    | 'SCHEDULED_API'
    | 'SOAP'
    | 'GRPC'
    | 'FILE_BATCH'
    | 'API_ENRICHMENT'
    | 'MANUAL';
  source_config?: string;
  source_connection_id?: string;
  sample_payload?: string;
  target_schema_ref?: string;
  transformation_rules?: any[];
  kafka_topic?: string;
  kafka_consumer_group?: string;
  webhook_path?: string;
  rest_api_path?: string;
  rest_api_method?: string;
  external_api_url?: string;
  schedule_cron?: string;
  input_schema?: string;
  canonical_schema_ref?: string;
  mapping_rules?: string;
  generated_jsonata?: string;
  validation_rules?: string;
  status?: 'DRAFT' | 'VALIDATING' | 'VALID' | 'INVALID' | 'READY_TO_PUBLISH';
  last_validated_at?: string;
  validation_result?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

export interface RequestPreviewRequest {
  context: Record<string, unknown>;
}

export interface RequestPreviewResponse {
  payload: Record<string, unknown> | null;
  headers: Record<string, string>;
}

@Injectable({
  providedIn: 'root'
})
export class MappingService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.api.baseUrl}/mapping-drafts`;

  list(): Observable<MappingDraft[]> {
    return this.http.get<MappingDraft[]>(this.baseUrl);
  }

  getById(id: string): Observable<MappingDraft> {
    return this.http.get<MappingDraft>(`${this.baseUrl}/${id}`).pipe(
      map(draft => {
        // Parse source_config if it's a string
        if (draft.source_config && typeof draft.source_config === 'string') {
          try {
            const parsed = JSON.parse(draft.source_config);
            // Keep it as string but ensure it's valid JSON
            draft.source_config = JSON.stringify(parsed);
          } catch (e) {
            console.warn('Failed to parse source_config:', e);
          }
        }
        return draft;
      })
    );
  }

  listByPartner(partnerId: string): Observable<MappingDraft[]> {
    return this.http.get<MappingDraft[]>(`${this.baseUrl}/partner/${partnerId}`);
  }

  create(draft: MappingDraft): Observable<MappingDraft> {
    return this.http.post<MappingDraft>(this.baseUrl, draft);
  }

  update(id: string, draft: MappingDraft): Observable<MappingDraft> {
    return this.http.put<MappingDraft>(`${this.baseUrl}/${id}`, draft);
  }

  previewRequest(id: string, request: RequestPreviewRequest): Observable<RequestPreviewResponse> {
    return this.http.post<RequestPreviewResponse>(`${this.baseUrl}/${id}/request-preview`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
