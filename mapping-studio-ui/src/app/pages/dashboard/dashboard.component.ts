import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { BadgeModule } from 'primeng/badge';
import { I18nPipe } from '../../core/i18n/i18n.pipe';
import { MetricsService } from '../../core/services/metrics.service';
import { MappingService, MappingDraft } from '../../core/services/mapping.service';
import { environment } from '../../../environments/environment';

interface StatCard {
  labelKey: string;
  changeKey: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: string;
  iconBg: string;
}

interface RecentMapping {
  partner: string;
  eventType: string;
  version: string;
  status: 'active' | 'draft' | 'deprecated';
  lastModified: string;
  modifiedBy: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, CardModule, TagModule, ButtonModule, TableModule, BadgeModule, I18nPipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  private readonly metricsService = inject(MetricsService);
  private readonly mappingService = inject(MappingService);

  readonly loading = signal(false);
  private readonly _stats = signal<StatCard[]>([]);
  private readonly _recentMappings = signal<RecentMapping[]>([]);
  
  readonly stats = this._stats.asReadonly();
  readonly recentMappings = this._recentMappings.asReadonly();
  readonly demoModeEnabled = environment.features.enableDemoMode;

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.loading.set(true);
    
    // Load metrics
    this.metricsService.getDashboardStats().subscribe({
      next: (data) => {
        if (!data) {
          this.loading.set(false);
          return;
        }
        this._stats.set([
          {
            labelKey: 'dashboard.stat.msgProcessed.label',
            changeKey: 'dashboard.stat.msgProcessed.change',
            value: this.formatNumber(data.messagesProcessed),
            change: '',
            changeType: 'positive',
            icon: 'pi-send',
            iconBg: '#dbeafe'
          },
          {
            labelKey: 'dashboard.stat.activeMappings.label',
            changeKey: 'dashboard.stat.activeMappings.change',
            value: String(data.activeMappings),
            change: '',
            changeType: 'positive',
            icon: 'pi-directions',
            iconBg: '#dcfce7'
          },
          {
            labelKey: 'dashboard.stat.dlq.label',
            changeKey: 'dashboard.stat.dlq.change',
            value: String(data.dlqCount),
            change: '',
            changeType: data.dlqCount > 10 ? 'negative' : 'neutral',
            icon: 'pi-exclamation-triangle',
            iconBg: '#fee2e2'
          },
          {
            labelKey: 'dashboard.stat.lag.label',
            changeKey: 'dashboard.stat.lag.change',
            value: String(data.consumerLag),
            change: '',
            changeType: 'neutral',
            icon: 'pi-clock',
            iconBg: '#fef9c3'
          },
          {
            labelKey: 'dashboard.stat.p99.label',
            changeKey: 'dashboard.stat.p99.change',
            value: `${data.p99Latency}ms`,
            change: '',
            changeType: 'positive',
            icon: 'pi-bolt',
            iconBg: '#f3e8ff'
          },
          {
            labelKey: 'dashboard.stat.partners.label',
            changeKey: 'dashboard.stat.partners.change',
            value: String(data.activePartners),
            change: '',
            changeType: 'neutral',
            icon: 'pi-building',
            iconBg: '#ffedd5'
          }
        ]);
      },
      error: (err) => {
        console.error('Failed to load dashboard stats:', err);
        this._stats.set([]);
        this.loading.set(false);
      }
    });

    // Load recent mappings
    this.mappingService.list().subscribe({
      next: (drafts) => {
        if (!drafts) {
          this._recentMappings.set([]);
          this.loading.set(false);
          return;
        }
        const mappings = Array.isArray(drafts) ? drafts : [];
        const recent = mappings
          .sort((a, b) => (b.updated_at || '').localeCompare(a.updated_at || ''))
          .slice(0, 5)
          .map(d => this.draftToRecentMapping(d));
        this._recentMappings.set(recent);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load recent mappings:', err);
        this._recentMappings.set([]);
        this.loading.set(false);
      }
    });
  }

  private draftToRecentMapping(draft: MappingDraft): RecentMapping {
    return {
      partner: draft.partner_id || 'unknown',
      eventType: draft.event_type || 'unknown',
      version: this.getVersionFromStatus(draft.status),
      status: this.mapDraftStatus(draft.status),
      lastModified: this.formatDate(draft.updated_at || draft.created_at),
      modifiedBy: draft.updated_by || draft.created_by || 'System'
    };
  }

  private getVersionFromStatus(status?: string): string {
    if (status === 'READY_TO_PUBLISH' || status === 'VALID') return 'v1.0.0';
    return 'draft';
  }

  private mapDraftStatus(status?: string): 'active' | 'draft' | 'deprecated' {
    if (status === 'READY_TO_PUBLISH' || status === 'VALID') return 'active';
    if (status === 'INVALID') return 'deprecated';
    return 'draft';
  }

  private formatDate(dateStr?: string): string {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toISOString().slice(0, 16).replace('T', ' ');
    } catch {
      return dateStr;
    }
  }

  private formatNumber(num: number): string {
    return num.toLocaleString();
  }

  getSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    const map: Record<string, 'success' | 'info' | 'warn' | 'danger' | 'secondary'> = {
      active: 'success',
      draft: 'warn',
      deprecated: 'secondary'
    };
    return map[status] ?? 'info';
  }
}
