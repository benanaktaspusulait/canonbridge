import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface MappingDraft {
  id?: string;
  tenant_id?: string;
  partner_id?: string;
  event_type?: string;
  name: string;
  description?: string;
  source_type?: 'KAFKA' | 'WEBHOOK' | 'SCHEDULED_API' | 'MANUAL';
  source_config?: string;
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

@Injectable({
  providedIn: 'root'
})
export class MappingService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.api.baseUrl}/mapping-drafts`;

  private headers(tenantId: string, userId?: string): HttpHeaders {
    let h = new HttpHeaders({ 'X-Tenant-Id': tenantId });
    if (userId) h = h.set('X-User-Id', userId);
    return h;
  }

  list(tenantId: string): Observable<MappingDraft[]> {
    return this.http.get<MappingDraft[]>(this.baseUrl, {
      headers: this.headers(tenantId)
    });
  }

  getById(tenantId: string, id: string): Observable<MappingDraft> {
    return this.http.get<MappingDraft>(`${this.baseUrl}/${id}`, {
      headers: this.headers(tenantId)
    });
  }

  listByPartner(tenantId: string, partnerId: string): Observable<MappingDraft[]> {
    return this.http.get<MappingDraft[]>(`${this.baseUrl}/partner/${partnerId}`, {
      headers: this.headers(tenantId)
    });
  }

  create(tenantId: string, draft: MappingDraft, userId?: string): Observable<MappingDraft> {
    return this.http.post<MappingDraft>(this.baseUrl, draft, {
      headers: this.headers(tenantId, userId)
    });
  }

  update(tenantId: string, id: string, draft: MappingDraft, userId?: string): Observable<MappingDraft> {
    return this.http.put<MappingDraft>(`${this.baseUrl}/${id}`, draft, {
      headers: this.headers(tenantId, userId)
    });
  }

  delete(tenantId: string, id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, {
      headers: this.headers(tenantId)
    });
  }
}
