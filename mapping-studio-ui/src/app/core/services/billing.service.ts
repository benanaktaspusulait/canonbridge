import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export interface Plan {
  id: string;
  code: string;
  name: string;
  description: string;
  price_monthly_cents: number;
  price_yearly_cents: number;
  currency: string;
  is_public: boolean;
  sort_order: number;
  features: PlanFeature[];
}

export interface PlanFeature {
  id: string;
  plan_id: string;
  feature_key: string;
  limit_value: number;
  unit: string;
  is_soft_limit: boolean;
  description: string;
}

export interface Subscription {
  id: string;
  org_id: string;
  plan_id: string;
  plan_code: string;
  plan_name: string;
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'paused';
  billing_cycle: 'monthly' | 'yearly';
  current_period_start: string;
  current_period_end: string;
  trial_end: string | null;
  cancel_at: string | null;
}

export interface EntitlementStatus {
  feature_key: string;
  limit: number;
  used: number;
  remaining: number;
  resets_at: string;
}

export interface UsageHistoryItem {
  metric: string;
  day: string;
  qty: number;
  cost_cents: number;
}

export interface Invoice {
  id: string;
  period_start: string;
  period_end: string;
  subtotal_cents: number;
  tax_cents: number;
  total_cents: number;
  status: 'draft' | 'open' | 'paid' | 'void';
  pdf_url: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class BillingService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly baseUrl = `${environment.api.baseUrl}/organizations`;
  private readonly plansUrl = `${environment.api.baseUrl}/plans`;

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

  private getOrgId(): string {
    // TODO: Get from org context when multi-org is implemented
    return 'a0000000-0000-0000-0000-000000000001';
  }

  // Plans
  getPlans(): Observable<Plan[]> {
    return this.http.get<Plan[]>(this.plansUrl, { headers: this.getHeaders() });
  }

  getPlan(code: string): Observable<Plan> {
    return this.http.get<Plan>(`${this.plansUrl}/${code}`, { headers: this.getHeaders() });
  }

  // Subscription
  getSubscription(): Observable<Subscription> {
    const orgId = this.getOrgId();
    return this.http.get<Subscription>(`${this.baseUrl}/${orgId}/subscription`, { headers: this.getHeaders() });
  }

  // Usage & Entitlements
  getUsageSummary(): Observable<EntitlementStatus[]> {
    const orgId = this.getOrgId();
    return this.http.get<EntitlementStatus[]>(`${this.baseUrl}/${orgId}/usage`, { headers: this.getHeaders() });
  }

  getUsageHistory(days: number = 30, metric?: string): Observable<UsageHistoryItem[]> {
    const orgId = this.getOrgId();
    let url = `${this.baseUrl}/${orgId}/usage/history?days=${days}`;
    if (metric) url += `&metric=${metric}`;
    return this.http.get<UsageHistoryItem[]>(url, { headers: this.getHeaders() });
  }

  getEntitlements(): Observable<EntitlementStatus[]> {
    const orgId = this.getOrgId();
    return this.http.get<EntitlementStatus[]>(`${this.baseUrl}/${orgId}/usage/entitlements`, { headers: this.getHeaders() });
  }
}
