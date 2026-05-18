import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DashboardStats {
  messagesProcessed: number;
  activeMappings: number;
  dlqCount: number;
  consumerLag: number;
  p99Latency: number;
  activePartners: number;
  errorRate?: number;
  topMappings?: TopMappingMetric[];
}

export interface TopMappingMetric {
  mappingId: string;
  name: string;
  partnerId: string;
  eventType: string;
  callCount: number;
  errorCount: number;
  avgLatencyMs: number;
}

export interface MonitoringMetrics {
  system: {
    throughput: number;
    p99Latency: number;
    dlqRate: number;
    consumerLag: number;
    errorRate: number;
    uptime: number;
  };
  window: string;
  timestamp: number;
  prometheusUrl?: string;
  grafanaUrl?: string;
  grafanaDashboardUrl?: string;
}

export interface PartnerHealthMetrics {
  window: string;
  partners: PartnerHealth[];
}

export interface PartnerHealth {
  partner: string;
  status: 'healthy' | 'degraded' | 'down';
  throughput: string;
  p99: string;
  dlqRate: string;
  lag: number;
  uptime: string;
}

@Injectable({
  providedIn: 'root'
})
export class MetricsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.api.baseUrl}/metrics`;

  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.baseUrl}/dashboard`);
  }

  getMonitoringMetrics(window: string = '1h'): Observable<MonitoringMetrics> {
    const params = new HttpParams().set('window', window);
    return this.http.get<MonitoringMetrics>(`${this.baseUrl}/monitoring`, { params });
  }

  getPartnerHealth(window: string = '1h'): Observable<PartnerHealthMetrics> {
    const params = new HttpParams().set('window', window);
    return this.http.get<PartnerHealthMetrics>(`${this.baseUrl}/partners/health`, { params });
  }
}
