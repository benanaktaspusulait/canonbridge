import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export interface Partner {
  id: string;
  tenant_id: string;
  external_id: string;
  name: string;
  description?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'ARCHIVED';
  metadata?: string;
  rate_limit_per_minute?: number;
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
  private readonly auth = inject(AuthService);
  private readonly baseUrl = `${environment.api.baseUrl}/partners`;

  private getHeaders(): HttpHeaders {
    const user = this.auth.currentUser();
    let headers = new HttpHeaders();
    
    if (user?.tenantId) {
      headers = headers.set('X-Tenant-Id', user.tenantId);
    }
    
    if (user?.id) {
      headers = headers.set('X-User-Id', user.id);
    }
    
    return headers;
  }

  list(): Observable<Partner[]> {
    return this.http.get<Partner[]>(this.baseUrl, { headers: this.getHeaders() });
  }

  async getAll(): Promise<Partner[]> {
    return this.http.get<Partner[]>(this.baseUrl, { headers: this.getHeaders() }).toPromise() as Promise<Partner[]>;
  }

  getById(id: string): Observable<Partner> {
    return this.http.get<Partner>(`${this.baseUrl}/${id}`, { headers: this.getHeaders() });
  }

  getByExternalId(externalId: string): Observable<Partner> {
    return this.http.get<Partner>(`${this.baseUrl}/external/${externalId}`, { headers: this.getHeaders() });
  }

  async create(partner: PartnerCreateRequest): Promise<Partner> {
    return this.http.post<Partner>(this.baseUrl, partner, { headers: this.getHeaders() }).toPromise() as Promise<Partner>;
  }

  async update(id: string, partner: PartnerUpdateRequest): Promise<Partner> {
    return this.http.put<Partner>(`${this.baseUrl}/${id}`, partner, { headers: this.getHeaders() }).toPromise() as Promise<Partner>;
  }

  async delete(id: string): Promise<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, { headers: this.getHeaders() }).toPromise() as Promise<void>;
  }
}
