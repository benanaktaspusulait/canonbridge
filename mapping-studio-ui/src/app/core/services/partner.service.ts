import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Partner {
  id: string;
  tenant_id: string;
  external_id: string;
  name: string;
  description?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'ARCHIVED';
  metadata?: string;
  rate_limit_per_minute?: number;
  external_system_id?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

export interface PartnerCreateRequest {
  external_id: string;
  name: string;
  description?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'ARCHIVED';
  metadata?: string;
  rate_limit_per_minute?: number;
}

export interface PartnerUpdateRequest {
  name?: string;
  description?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'ARCHIVED';
  metadata?: string;
  rate_limit_per_minute?: number;
}

@Injectable({
  providedIn: 'root'
})
export class PartnerService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.api.baseUrl}/partners`;

  // [H2] No custom tenant/user headers — interceptor sends Bearer token,
  // backend derives identity from JWT claims.

  list(): Observable<Partner[]> {
    return this.http.get<Partner[]>(this.baseUrl);
  }

  getById(id: string): Observable<Partner> {
    return this.http.get<Partner>(`${this.baseUrl}/${id}`);
  }

  getByExternalId(externalId: string): Observable<Partner> {
    return this.http.get<Partner>(`${this.baseUrl}/external/${externalId}`);
  }

  create(partner: PartnerCreateRequest): Observable<Partner> {
    return this.http.post<Partner>(this.baseUrl, partner);
  }

  update(id: string, partner: PartnerUpdateRequest): Observable<Partner> {
    return this.http.put<Partner>(`${this.baseUrl}/${id}`, partner);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
