import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ProgressBarModule } from 'primeng/progressbar';
import { MessageService } from 'primeng/api';

interface DemoStep {
  id: number;
  title: string;
  description: string;
  route?: string;
  duration: string;
  icon: string;
  highlight: string;
  status: 'pending' | 'active' | 'done';
}

interface DemoRule {
  target: string;
  source: string;
  transform: string;
}

interface DemoMetric {
  label: string;
  value: string;
  caption: string;
  tone: 'blue' | 'green' | 'amber';
}

interface DemoTimelineItem {
  title: string;
  detail: string;
}

@Component({
  selector: 'app-demo',
  standalone: true,
  imports: [ButtonModule, CardModule, TagModule, ToastModule, ProgressBarModule],
  providers: [MessageService],
  template: `
    <p-toast />

    <div class="page-header">
      <div>
        <h1 class="page-title">Demo Merkezi</h1>
        <p class="page-subtitle">
          ACME Marketplace order.created akışının uçtan uca canlı hikayesi
        </p>
      </div>
      <div class="page-actions">
        <p-button
          [label]="running() ? 'Oynatılıyor' : 'Demoyu oynat'"
          icon="pi pi-play"
          severity="success"
          [disabled]="running()"
          (onClick)="startDemo()"
        />
        <p-button
          label="Sıfırla"
          icon="pi pi-refresh"
          severity="secondary"
          variant="outlined"
          [disabled]="running()"
          (onClick)="resetDemo()"
        />
        <p-button
          label="Studio'yu aç"
          icon="pi pi-objects-column"
          severity="secondary"
          variant="outlined"
          (onClick)="openRoute('/studio')"
        />
      </div>
    </div>

    <section class="demo-stage" aria-label="Demo overview">
      <div class="demo-stage-main">
        <p-tag value="Sandbox senaryosu" severity="info" />
        <h2>{{ selectedStep().title }}</h2>
        <p>{{ selectedStep().highlight }}</p>

        <div class="flow-strip" aria-label="Integration flow">
          <div class="flow-node">
            <span class="node-kicker">Source</span>
            <strong>ACME Marketplace</strong>
            <small>orders.acme.created</small>
          </div>
          <i class="pi pi-arrow-right" aria-hidden="true"></i>
          <div class="flow-node flow-node--active">
            <span class="node-kicker">CanonBridge</span>
            <strong>Mapping Studio</strong>
            <small>JSONata + schema guard</small>
          </div>
          <i class="pi pi-arrow-right" aria-hidden="true"></i>
          <div class="flow-node">
            <span class="node-kicker">Target</span>
            <strong>Fulfillment API</strong>
            <small>canonical.order.v1</small>
          </div>
        </div>
      </div>

      <aside class="demo-stage-side" aria-label="Demo status">
        <div class="run-status">
          <span class="run-dot" [class.run-dot--active]="running()"></span>
          <div>
            <strong>{{ running() ? 'Sahne oynatılıyor' : 'Demo hazır' }}</strong>
            <small>{{
              running() ? selectedStep().title : 'Ekran, konuşulacak demo çıktılarıyla hazır.'
            }}</small>
          </div>
        </div>
        <p-progressBar [value]="progress()" [showValue]="true" />
        <div class="scenario-facts">
          <span><strong>Partner</strong> ACME Marketplace</span>
          <span><strong>Event</strong> order.created</span>
          <span><strong>SLA</strong> 300 ms p95</span>
        </div>
      </aside>
    </section>

    <section class="demo-metrics" aria-label="Demo metrics">
      @for (metric of metrics; track metric.label) {
        <div class="metric-card metric-card--{{ metric.tone }}">
          <span>{{ metric.label }}</span>
          <strong>{{ metric.value }}</strong>
          <small>{{ metric.caption }}</small>
        </div>
      }
    </section>

    <section class="demo-workbench" aria-label="Demo data preview">
      <div class="workbench-panel">
        <div class="panel-heading">
          <span>Kaynak event</span>
          <p-tag value="JSON" severity="secondary" />
        </div>
        <pre class="demo-code">{{ sourcePayload }}</pre>
      </div>

      <div class="workbench-panel">
        <div class="panel-heading">
          <span>Mapping kuralları</span>
          <p-tag value="5 kural" severity="info" />
        </div>
        <div class="rule-list">
          @for (rule of rules; track rule.target) {
            <div class="rule-row">
              <code>{{ rule.target }}</code>
              <i class="pi pi-arrow-left" aria-hidden="true"></i>
              <span>{{ rule.source }}</span>
              <small>{{ rule.transform }}</small>
            </div>
          }
        </div>
      </div>

      <div class="workbench-panel">
        <div class="panel-heading">
          <span>Canonical çıktı</span>
          <p-tag value="Valid" severity="success" />
        </div>
        <pre class="demo-code">{{ canonicalOutput }}</pre>
      </div>
    </section>

    <div class="demo-steps-grid">
      @for (step of steps(); track step.id; let index = $index) {
        <p-card
          [styleClass]="stepCardClass(step)"
          role="button"
          tabindex="0"
          [attr.aria-current]="step.status === 'active' ? 'step' : null"
          (click)="focusStep(index)"
          (keydown.enter)="focusStep(index)"
          (keydown.space)="focusStep(index); $event.preventDefault()"
        >
          <div class="demo-step-header">
            <span class="demo-step-number">{{ step.id }}</span>
            <i [class]="step.icon + ' demo-step-icon'" aria-hidden="true"></i>
            <p-tag
              [value]="statusLabel(step.status)"
              [severity]="statusSeverity(step.status)"
              class="demo-step-tag"
            />
          </div>
          <h3 class="demo-step-title">{{ step.title }}</h3>
          <p class="demo-step-desc">{{ step.description }}</p>
          <div class="demo-step-footer">
            <span>
              <i class="pi pi-clock" aria-hidden="true"></i>
              {{ step.duration }}
            </span>
            @if (step.route) {
              <button class="step-link" type="button" (click)="openRoute(step.route, $event)">
                <i class="pi pi-external-link" aria-hidden="true"></i>
                Aç
              </button>
            }
          </div>
        </p-card>
      }
    </div>

    <section class="demo-timeline" aria-label="Runtime timeline">
      <div class="section-heading">
        <div>
          <h2>Runtime izi</h2>
          <p>Demo ilerledikçe anlatılacak operasyon sinyalleri burada kalır.</p>
        </div>
        <p-button
          label="DLQ ekranı"
          icon="pi pi-inbox"
          size="small"
          severity="secondary"
          variant="outlined"
          (onClick)="openRoute('/dlq')"
        />
      </div>

      <div class="timeline-list">
        @for (item of timeline; track item.title; let index = $index) {
          <div class="timeline-item timeline-item--{{ timelineStatus(index) }}">
            <span class="timeline-icon">
              <i [class]="timelineIcon(index)" aria-hidden="true"></i>
            </span>
            <div>
              <strong>{{ item.title }}</strong>
              <p>{{ item.detail }}</p>
            </div>
          </div>
        }
      </div>
    </section>
  `,
  styles: [
    `
      .demo-stage,
      .demo-workbench,
      .demo-timeline {
        background: var(--surface-card);
        border: 1px solid var(--surface-border);
        border-radius: 8px;
        box-shadow: 0 12px 32px rgba(15, 23, 42, 0.06);
      }

      .demo-stage {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 320px;
        gap: 1.25rem;
        padding: 1.25rem;
        margin-bottom: 1rem;
      }

      .demo-stage-main h2 {
        font-size: 1.4rem;
        line-height: 1.2;
        margin: 0.75rem 0 0.5rem;
        color: var(--text-color);
      }

      .demo-stage-main p {
        max-width: 720px;
        color: var(--text-color-secondary);
        line-height: 1.55;
        margin: 0;
      }

      .flow-strip {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr) auto minmax(0, 1fr);
        align-items: stretch;
        gap: 0.75rem;
        margin-top: 1.25rem;
      }

      .flow-strip > i {
        align-self: center;
        color: var(--text-color-secondary);
      }

      .flow-node {
        min-height: 92px;
        border: 1px solid var(--surface-border);
        border-radius: 8px;
        padding: 0.9rem;
        background: var(--surface-ground);
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 0.25rem;
      }

      .flow-node--active {
        border-color: color-mix(in srgb, var(--primary-color) 38%, var(--surface-border));
        background: color-mix(in srgb, var(--primary-color) 8%, var(--surface-card));
      }

      .node-kicker {
        font-size: 0.68rem;
        font-weight: 700;
        letter-spacing: 0;
        text-transform: uppercase;
        color: var(--text-color-secondary);
      }

      .flow-node strong {
        font-size: 0.95rem;
        color: var(--text-color);
      }

      .flow-node small {
        color: var(--text-color-secondary);
        overflow-wrap: anywhere;
      }

      .demo-stage-side {
        border-left: 1px solid var(--surface-border);
        padding-left: 1.25rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        min-width: 0;
      }

      .run-status {
        display: flex;
        gap: 0.75rem;
        align-items: flex-start;
      }

      .run-status strong,
      .run-status small {
        display: block;
      }

      .run-status small {
        margin-top: 0.2rem;
        color: var(--text-color-secondary);
        line-height: 1.4;
      }

      .run-dot {
        width: 0.7rem;
        height: 0.7rem;
        border-radius: 999px;
        margin-top: 0.25rem;
        background: var(--green-500);
        box-shadow: 0 0 0 4px color-mix(in srgb, var(--green-500) 16%, transparent);
        flex-shrink: 0;
      }

      .run-dot--active {
        background: var(--primary-color);
        box-shadow: 0 0 0 4px color-mix(in srgb, var(--primary-color) 16%, transparent);
      }

      .scenario-facts {
        display: grid;
        gap: 0.5rem;
        font-size: 0.82rem;
      }

      .scenario-facts span {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        border-top: 1px solid var(--surface-border);
        padding-top: 0.5rem;
        color: var(--text-color-secondary);
      }

      .scenario-facts strong {
        color: var(--text-color);
      }

      .demo-metrics {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 0.75rem;
        margin-bottom: 1rem;
      }

      .metric-card {
        min-height: 108px;
        border: 1px solid var(--surface-border);
        border-radius: 8px;
        padding: 0.9rem;
        background: var(--surface-card);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }

      .metric-card span {
        color: var(--text-color-secondary);
        font-size: 0.76rem;
        font-weight: 600;
      }

      .metric-card strong {
        font-size: 1.35rem;
        color: var(--text-color);
      }

      .metric-card small {
        color: var(--text-color-secondary);
        line-height: 1.35;
      }

      .metric-card--blue {
        border-top: 3px solid #2563eb;
      }
      .metric-card--green {
        border-top: 3px solid #16a34a;
      }
      .metric-card--amber {
        border-top: 3px solid #d97706;
      }

      .demo-workbench {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(260px, 0.9fr) minmax(0, 1fr);
        overflow: hidden;
        margin-bottom: 1rem;
      }

      .workbench-panel {
        min-width: 0;
        padding: 1rem;
        border-right: 1px solid var(--surface-border);
      }

      .workbench-panel:last-child {
        border-right: none;
      }

      .panel-heading,
      .section-heading {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 1rem;
      }

      .panel-heading {
        margin-bottom: 0.75rem;
        font-weight: 700;
      }

      .demo-code {
        min-height: 320px;
        max-height: 320px;
        overflow: auto;
        margin: 0;
        padding: 0.9rem;
        border-radius: 8px;
        background: #0f172a;
        color: #dbeafe;
        border: 1px solid rgba(148, 163, 184, 0.22);
        font-family: 'JetBrains Mono', 'Fira Code', monospace;
        font-size: 0.74rem;
        line-height: 1.55;
        white-space: pre-wrap;
        overflow-wrap: anywhere;
      }

      .rule-list {
        display: grid;
        gap: 0.6rem;
      }

      .rule-row {
        min-height: 58px;
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        gap: 0.3rem 0.55rem;
        align-items: center;
        padding: 0.7rem;
        border: 1px solid var(--surface-border);
        border-radius: 8px;
        background: var(--surface-ground);
      }

      .rule-row code {
        min-width: 0;
        overflow-wrap: anywhere;
      }

      .rule-row > i {
        color: var(--text-color-secondary);
      }

      .rule-row span,
      .rule-row small {
        grid-column: 1 / -1;
        color: var(--text-color-secondary);
        line-height: 1.35;
      }

      .rule-row small {
        color: #15803d;
        font-weight: 600;
      }

      .demo-steps-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
        gap: 0.75rem;
        margin-bottom: 1rem;
      }

      .demo-step-card {
        cursor: pointer;
        transition:
          box-shadow 0.15s,
          border-color 0.15s,
          transform 0.15s;
        border: 1px solid var(--surface-border);
        height: 100%;
      }

      .demo-step-card:hover {
        box-shadow: 0 8px 22px rgba(15, 23, 42, 0.09);
        transform: translateY(-1px);
      }

      .demo-step-card--active {
        border-color: var(--primary-color);
        box-shadow: 0 0 0 1px color-mix(in srgb, var(--primary-color) 22%, transparent);
      }

      .demo-step-card--done {
        border-color: color-mix(in srgb, var(--green-500) 54%, var(--surface-border));
      }

      .demo-step-header {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.75rem;
      }

      .demo-step-number {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 1.75rem;
        height: 1.75rem;
        border-radius: 8px;
        background: var(--surface-200);
        font-weight: 700;
        font-size: 0.8rem;
        flex-shrink: 0;
      }

      .demo-step-icon {
        font-size: 1.15rem;
        color: var(--primary-color);
      }

      .demo-step-tag {
        margin-left: auto;
      }

      .demo-step-title {
        font-size: 0.98rem;
        font-weight: 700;
        margin: 0 0 0.4rem;
        color: var(--text-color);
      }

      .demo-step-desc {
        min-height: 58px;
        font-size: 0.8125rem;
        color: var(--text-color-secondary);
        margin: 0 0 0.75rem;
        line-height: 1.5;
      }

      .demo-step-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.5rem;
        color: var(--text-color-secondary);
        font-size: 0.75rem;
      }

      .demo-step-footer span {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
      }

      .step-link {
        display: inline-flex;
        align-items: center;
        gap: 0.3rem;
        border: 1px solid var(--surface-border);
        background: var(--surface-card);
        color: var(--text-color);
        border-radius: 8px;
        padding: 0.35rem 0.5rem;
        cursor: pointer;
        font: inherit;
        font-weight: 600;
      }

      .step-link:hover {
        border-color: var(--primary-color);
        color: var(--primary-color);
      }

      .demo-timeline {
        padding: 1rem;
      }

      .section-heading {
        margin-bottom: 1rem;
      }

      .section-heading h2 {
        margin: 0 0 0.2rem;
        font-size: 1rem;
        color: var(--text-color);
      }

      .section-heading p {
        margin: 0;
        color: var(--text-color-secondary);
        font-size: 0.82rem;
      }

      .timeline-list {
        display: grid;
        grid-template-columns: repeat(5, minmax(0, 1fr));
        gap: 0.75rem;
      }

      .timeline-item {
        min-height: 112px;
        border: 1px solid var(--surface-border);
        border-radius: 8px;
        padding: 0.8rem;
        background: var(--surface-ground);
        display: flex;
        gap: 0.65rem;
      }

      .timeline-icon {
        width: 1.75rem;
        height: 1.75rem;
        border-radius: 8px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        background: var(--surface-200);
        color: var(--text-color-secondary);
      }

      .timeline-item strong {
        display: block;
        font-size: 0.85rem;
        margin-bottom: 0.25rem;
        color: var(--text-color);
      }

      .timeline-item p {
        margin: 0;
        color: var(--text-color-secondary);
        font-size: 0.76rem;
        line-height: 1.42;
      }

      .timeline-item--active {
        border-color: var(--primary-color);
        background: color-mix(in srgb, var(--primary-color) 7%, var(--surface-card));
      }

      .timeline-item--active .timeline-icon {
        background: var(--primary-color);
        color: #fff;
      }

      .timeline-item--done .timeline-icon {
        background: #16a34a;
        color: #fff;
      }

      @media (max-width: 1180px) {
        .demo-stage,
        .demo-workbench {
          grid-template-columns: 1fr;
        }

        .demo-stage-side,
        .workbench-panel {
          border-left: none;
          border-right: none;
          border-top: 1px solid var(--surface-border);
          padding-left: 0;
          padding-top: 1rem;
        }

        .workbench-panel:first-child {
          border-top: none;
        }

        .demo-metrics,
        .timeline-list {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }

      @media (max-width: 720px) {
        .flow-strip,
        .demo-metrics,
        .timeline-list {
          grid-template-columns: 1fr;
        }

        .flow-strip > i {
          transform: rotate(90deg);
          justify-self: center;
        }

        .demo-stage {
          padding: 1rem;
        }

        .demo-code {
          min-height: 240px;
          max-height: 240px;
        }
      }
    `,
  ],
})
export class DemoComponent {
  private readonly router = inject(Router);
  private readonly toast = inject(MessageService);
  private runId = 0;

  readonly running = signal(false);
  readonly progress = signal(0);
  readonly currentStepIndex = signal(0);

  readonly steps = signal<DemoStep[]>([
    {
      id: 1,
      title: 'Partner ve event seçimi',
      description:
        'ACME Marketplace için order.created akışı, kaynak topic ve hedef API birlikte seçilir.',
      route: '/partners',
      duration: '~30 sn',
      icon: 'pi pi-building',
      highlight:
        'Demo, partner seçimiyle başlar: kaynak topic, tenant bağlamı ve hedef fulfillment endpointi aynı hikayede sabitlenir.',
      status: 'active',
    },
    {
      id: 2,
      title: 'Kaynak payload yakalama',
      description:
        'Gerçekçi sipariş payloadu ekranda görülür; alanlar mapping için hazır hale gelir.',
      route: '/studio',
      duration: '~45 sn',
      icon: 'pi pi-upload',
      highlight:
        'Kaynak event saklanmış bir fixture değil, satış demosunda konuşulabilecek alanlara sahip okunur bir örnek payload olarak görünür.',
      status: 'pending',
    },
    {
      id: 3,
      title: 'Mapping kuralları',
      description:
        'Canonical alanlar kaynak alanlara bağlanır, para birimi ve tarih dönüşümleri netleştirilir.',
      route: '/studio',
      duration: '~2 dk',
      icon: 'pi pi-objects-column',
      highlight:
        'Kurallar, hedef alan ile kaynak alan arasındaki ilişkiyi ve uygulanan dönüşümü açıkça gösterir.',
      status: 'pending',
    },
    {
      id: 4,
      title: 'Test ve doğrulama',
      description:
        'Canonical çıktı valid durumuna gelir; gecikme, schema ve replay sinyalleri görünür.',
      route: '/studio',
      duration: '~45 sn',
      icon: 'pi pi-check-circle',
      highlight:
        'Test sahnesi yalnızca başarılı mesajı vermez; valid canonical çıktı ve operasyon metriklerini aynı anda gösterir.',
      status: 'pending',
    },
    {
      id: 5,
      title: 'Yayın ve izleme',
      description:
        'Mapping publish edilir, DLQ temiz kalır ve runtime izi operatör ekranına bağlanır.',
      route: '/dlq',
      duration: '~30 sn',
      icon: 'pi pi-send',
      highlight:
        'Final sahnesi, demo anlatımını operasyonel güvenle kapatır: publish, izleme ve DLQ durumu tek panelde okunur.',
      status: 'pending',
    },
  ]);

  readonly selectedStep = computed(() => this.steps()[this.currentStepIndex()] ?? this.steps()[0]);

  readonly metrics: DemoMetric[] = [
    { label: 'Schema sonucu', value: 'Valid', caption: '12 zorunlu alan tamam', tone: 'green' },
    { label: 'Preview latency', value: '184 ms', caption: 'p95 hedefinin altında', tone: 'blue' },
    { label: 'Mapping kapsamı', value: '5/5', caption: 'Canonical alanlar eşlendi', tone: 'green' },
    { label: 'DLQ riski', value: '0', caption: 'Replay gerektiren mesaj yok', tone: 'amber' },
  ];

  readonly rules: DemoRule[] = [
    { target: 'order.id', source: '$.order.id', transform: 'trim + required' },
    { target: 'order.total.amount', source: '$.payment.amount_cents', transform: 'cents / 100' },
    { target: 'order.total.currency', source: '$.payment.currency', transform: 'uppercase' },
    { target: 'customer.email', source: '$.buyer.email', transform: 'lowercase' },
    { target: 'fulfillment.priority', source: '$.shipping.service', transform: 'enum map' },
  ];

  readonly timeline: DemoTimelineItem[] = [
    {
      title: 'Webhook alındı',
      detail: 'ACME order.created mesajı tenant ve event tipiyle kaydedildi.',
    },
    {
      title: 'Schema kontrolü',
      detail: 'Kaynak payload zorunlu alanlar ve tip kurallarından geçti.',
    },
    { title: 'Mapping çalıştı', detail: 'JSONata kuralları canonical order modelini üretti.' },
    { title: 'Publish edildi', detail: 'Aktif mapping sürümü fulfillment hedefi için hazırlandı.' },
    { title: 'DLQ temiz', detail: 'Operatör ekranı hata, replay ve retry sinyallerini izliyor.' },
  ];

  readonly sourcePayload = `{
  "event": "order.created",
  "partner": "ACME Marketplace",
  "order": {
    "id": "ACME-10492",
    "created_at": "2026-05-14T09:42:18Z"
  },
  "buyer": {
    "email": "MIRA.KAYA@EXAMPLE.COM",
    "loyalty_tier": "gold"
  },
  "payment": {
    "amount_cents": 12990,
    "currency": "try"
  },
  "shipping": {
    "service": "express",
    "city": "Istanbul"
  }
}`;

  readonly canonicalOutput = `{
  "schema": "canonical.order.v1",
  "partnerId": "acme-marketplace",
  "order": {
    "id": "ACME-10492",
    "createdAt": "2026-05-14T09:42:18Z",
    "total": {
      "amount": 129.9,
      "currency": "TRY"
    }
  },
  "customer": {
    "email": "mira.kaya@example.com",
    "segment": "gold"
  },
  "fulfillment": {
    "priority": "EXPRESS",
    "destinationCity": "Istanbul"
  }
}`;

  focusStep(index: number): void {
    if (this.running()) return;
    this.setActiveStep(index);
    this.progress.set(this.progressForIndex(index));
  }

  openRoute(route: string, event?: Event): void {
    event?.stopPropagation();
    this.router.navigate([route]);
  }

  async startDemo(): Promise<void> {
    const runId = ++this.runId;
    this.running.set(true);
    this.progress.set(0);
    this.setActiveStep(0);

    const stepDurations = [850, 950, 1100, 950, 850];

    for (let i = 0; i < this.steps().length; i++) {
      if (runId !== this.runId) return;
      this.setActiveStep(i);
      this.progress.set(this.progressForIndex(i));

      await this.sleep(stepDurations[i]);

      if (runId !== this.runId) return;
      this.markStep(i, 'done');
      this.progress.set(this.progressForIndex(i + 1));
    }

    this.running.set(false);
    this.currentStepIndex.set(this.steps().length - 1);
    this.progress.set(100);
    this.toast.add({
      severity: 'success',
      summary: 'Demo hazır',
      detail: 'Canonical çıktı, mapping kuralları ve runtime izi ekranda görünür durumda.',
      life: 6000,
    });
  }

  resetDemo(): void {
    this.runId++;
    this.running.set(false);
    this.progress.set(0);
    this.setActiveStep(0);
  }

  statusLabel(status: DemoStep['status']): string {
    if (status === 'done') return 'Tamam';
    if (status === 'active') return 'Sahnede';
    return 'Sırada';
  }

  statusSeverity(status: DemoStep['status']): 'success' | 'info' | 'secondary' {
    if (status === 'done') return 'success';
    if (status === 'active') return 'info';
    return 'secondary';
  }

  stepCardClass(step: DemoStep): string {
    return `demo-step-card demo-step-card--${step.status}`;
  }

  timelineStatus(index: number): DemoStep['status'] {
    if (!this.running() && this.progress() === 100) return 'done';
    if (index < this.currentStepIndex()) return 'done';
    if (index === this.currentStepIndex()) return 'active';
    return 'pending';
  }

  timelineIcon(index: number): string {
    const status = this.timelineStatus(index);
    if (status === 'done') return 'pi pi-check';
    if (status === 'active') return 'pi pi-bolt';
    return 'pi pi-circle';
  }

  private setActiveStep(index: number): void {
    const boundedIndex = Math.max(0, Math.min(index, this.steps().length - 1));
    this.currentStepIndex.set(boundedIndex);
    this.steps.update((steps) =>
      steps.map((step, stepIndex) => ({
        ...step,
        status:
          stepIndex < boundedIndex ? 'done' : stepIndex === boundedIndex ? 'active' : 'pending',
      })),
    );
  }

  private markStep(index: number, status: DemoStep['status']): void {
    this.steps.update((steps) =>
      steps.map((step, stepIndex) => (stepIndex === index ? { ...step, status } : step)),
    );
  }

  private progressForIndex(index: number): number {
    return Math.min(100, Math.round((index / this.steps().length) * 100));
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
