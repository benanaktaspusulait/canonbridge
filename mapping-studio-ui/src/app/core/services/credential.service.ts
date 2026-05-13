import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export type CredentialAuthType = 'API_KEY' | 'BASIC_AUTH' | 'BEARER_TOKEN' | 'OAUTH2_CLIENT_CREDENTIALS';
export type CredentialEnvironment = 'SANDBOX' | 'PRODUCTION';
export type CredentialStatus = 'ACTIVE' | 'INACTIVE' | 'EXPIRED' | 'ROTATION_REQUIRED';

export interface Credential {
  credential_id: string;
  tenant_id?: string;
  display_name: string;
  auth_type: CredentialAuthType;
  environment: CredentialEnvironment;
  status: CredentialStatus;
  rotation_due_at?: string;
  last_used_at?: string;
  created_by?: string;
  created_at?: string;
  updated_by?: string;
  updated_at?: string;
}

export interface CreateCredentialRequest {
  displayName: string;
  authType: CredentialAuthType;
  environment: CredentialEnvironment;
  secret: Record<string, string>;
  rotationDueAt?: string;
}

@Injectable({ providedIn: 'root' })
export class CredentialService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.api.baseUrl}/credentials`;

  list(): Observable<Credential[]> {
    return this.http.get<Credential[]>(this.baseUrl);
  }

  create(request: CreateCredentialRequest): Observable<Credential> {
    return this.http.post<Credential>(this.baseUrl, request);
  }
}
