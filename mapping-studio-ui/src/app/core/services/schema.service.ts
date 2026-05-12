import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface SchemaDefinition {
  id?: string;
  tenant_id?: string;
  name: string;
  schema_type: 'CANONICAL' | 'PARTNER_INBOUND' | 'PARTNER_OUTBOUND' | 'INTERNAL';
  subject: string;
  version: number;
  schema_json: string;
  compatibility_mode?: 'BACKWARD' | 'FORWARD' | 'FULL' | 'NONE';
  status?: 'ACTIVE' | 'DEPRECATED' | 'DRAFT';
  description?: string;
  created_by?: string;
  created_at?: string;
  updated_by?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SchemaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.api.baseUrl}/schemas`;

  list(): Observable<SchemaDefinition[]> {
    return this.http.get<SchemaDefinition[]>(this.baseUrl);
  }

  getById(id: string): Observable<SchemaDefinition> {
    return this.http.get<SchemaDefinition>(`${this.baseUrl}/${id}`);
  }

  listByType(schemaType: SchemaDefinition['schema_type']): Observable<SchemaDefinition[]> {
    return this.http.get<SchemaDefinition[]>(`${this.baseUrl}/type/${schemaType}`);
  }

  listBySubject(subject: string): Observable<SchemaDefinition[]> {
    return this.http.get<SchemaDefinition[]>(`${this.baseUrl}/subject/${subject}`);
  }

  getLatestActive(subject: string): Observable<SchemaDefinition> {
    return this.http.get<SchemaDefinition>(`${this.baseUrl}/subject/${subject}/latest`);
  }

  create(schema: SchemaDefinition): Observable<SchemaDefinition> {
    return this.http.post<SchemaDefinition>(this.baseUrl, schema);
  }

  update(id: string, schema: SchemaDefinition): Observable<SchemaDefinition> {
    return this.http.put<SchemaDefinition>(`${this.baseUrl}/${id}`, schema);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
