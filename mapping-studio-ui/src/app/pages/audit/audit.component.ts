import { DatePipe, JsonPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

interface AuditLog {
  id?: string;
  action?: string;
  resource_type?: string;
  resource_id?: string;
  outcome?: string;
  user_id?: string;
  correlation_id?: string;
  details?: unknown;
  created_at?: string;
}

@Component({
  selector: 'app-audit',
  standalone: true,
  imports: [DatePipe, JsonPipe, ButtonModule, CardModule, TableModule, TagModule],
  templateUrl: './audit.component.html',
  styleUrl: './audit.component.scss'
})
export class AuditComponent implements OnInit {
  private readonly http = inject(HttpClient);

  readonly loading = signal(false);
  readonly logs = signal<AuditLog[]>([]);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    const params = new HttpParams().set('limit', '100').set('offset', '0');
    this.http.get<AuditLog[]>(`/api/audit-logs`, {
      params,
      headers: { 'X-Tenant-Id': 'tenant-acme' }
    }).subscribe({
      next: (logs) => {
        this.logs.set(logs ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.logs.set([]);
        this.loading.set(false);
      }
    });
  }

  severity(outcome?: string): 'success' | 'warn' | 'danger' | 'secondary' {
    if (outcome === 'SUCCESS') return 'success';
    if (outcome === 'DENIED') return 'warn';
    if (outcome === 'FAILURE') return 'danger';
    return 'secondary';
  }
}
