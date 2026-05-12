import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressBarModule } from 'primeng/progressbar';
import { MessageService } from 'primeng/api';
import { I18nPipe } from '../../core/i18n/i18n.pipe';
import { I18nService } from '../../core/i18n/i18n.service';

interface DemoStep {
  id: number;
  title: string;
  description: string;
  route?: string;
  duration: string;
  icon: string;
  status: 'pending' | 'active' | 'done';
}

@Component({
  selector: 'app-demo',
  standalone: true,
  imports: [ButtonModule, CardModule, TagModule, ToastModule, TooltipModule, ProgressBarModule],
  providers: [MessageService],
  template: `
    <p-toast />

    <div class="page-header">
      <div>
        <h1 class="page-title">🚀 Demo Modu</h1>
        <p class="page-subtitle">CanonBridge Mapping Studio — 5 dakikada satış demosu</p>
      </div>
      <div class="page-actions">
        <p-button
          label="Demoyu Başlat"
          icon="pi pi-play"
          severity="success"
          [disabled]="running()"
          (onClick)="startDemo()" />
        <p-button
          label="Sıfırla"
          icon="pi pi-refresh"
          severity="secondary"
          variant="outlined"
          [disabled]="running()"
          (onClick)="resetDemo()" />
      </div>
    </div>

    @if (running()) {
      <p-card styleClass="mb-3">
        <div style="display:flex;align-items:center;gap:1rem;margin-bottom:0.5rem">
          <i class="pi pi-spin pi-spinner" style="font-size:1.25rem;color:var(--primary-color)"></i>
          <strong>Demo çalışıyor… {{ currentStepLabel() }}</strong>
        </div>
        <p-progressBar [value]="progress()" [showValue]="false" />
      </p-card>
    }

    <div class="demo-steps-grid">
      @for (step of steps(); track step.id) {
        <p-card
          [styleClass]="'demo-step-card demo-step-card--' + step.status"
          (click)="navigateToStep(step)">
          <div class="demo-step-header">
            <span class="demo-step-number">{{ step.id }}</span>
            <i [class]="step.icon + ' demo-step-icon'" aria-hidden="true"></i>
            <p-tag
              [value]="statusLabel(step.status)"
              [severity]="statusSeverity(step.status)"
              class="demo-step-tag" />
          </div>
          <h3 class="demo-step-title">{{ step.title }}</h3>
          <p class="demo-step-desc">{{ step.description }}</p>
          <div class="demo-step-footer">
            <i class="pi pi-clock" style="font-size:0.75rem"></i>
            <span class="demo-step-duration">{{ step.duration }}</span>
          </div>
        </p-card>
      }
    </div>

    <p-card header="Demo Senaryosu" styleClass="mt-4">
      <p class="text-sm">Bu demo aşağıdaki uçtan uca akışı gösterir:</p>
      <ol style="line-height:2;font-size:0.875rem;padding-left:1.25rem">
        <li>Mock Kafka ortamında bir partner (ACME Marketplace) kaydedilir</li>
        <li>order.created olayı için bir kaynak şema yüklenir</li>
        <li>Canonical model'e mapping kuralları tanımlanır</li>
        <li>Gerçek zamanlı önizleme ile doğrulama yapılır</li>
        <li>Mapping yayınlanır ve DLQ monitör edilir</li>
      </ol>
    </p-card>
  `,
  styles: [`
    .demo-steps-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1rem;
    }
    .demo-step-card {
      cursor: pointer;
      transition: box-shadow 0.15s, border-color 0.15s;
      border: 2px solid transparent;
    }
    .demo-step-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.12); }
    .demo-step-card--active { border-color: var(--primary-color); }
    .demo-step-card--done   { border-color: var(--green-500); }
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
      border-radius: 50%;
      background: var(--surface-200);
      font-weight: 700;
      font-size: 0.8rem;
      flex-shrink: 0;
    }
    .demo-step-icon {
      font-size: 1.25rem;
      color: var(--primary-color);
    }
    .demo-step-tag { margin-left: auto; }
    .demo-step-title {
      font-size: 1rem;
      font-weight: 600;
      margin: 0 0 0.4rem;
    }
    .demo-step-desc {
      font-size: 0.8125rem;
      color: var(--text-color-secondary);
      margin: 0 0 0.75rem;
      line-height: 1.5;
    }
    .demo-step-footer {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      color: var(--text-color-secondary);
    }
    .demo-step-duration { font-size: 0.75rem; }
  `]
})
export class DemoComponent {
  private readonly router = inject(Router);
  private readonly i18n = inject(I18nService);
  private readonly toast = inject(MessageService);

  readonly running = signal(false);
  readonly progress = signal(0);
  readonly currentStepLabel = signal('');

  readonly steps = signal<DemoStep[]>([
    {
      id: 1,
      title: 'Partner Kaydı',
      description: 'ACME Marketplace partnerini sisteme ekleyin ve kimlik bilgilerini tanımlayın.',
      route: '/partners',
      duration: '~30 sn',
      icon: 'pi pi-building',
      status: 'pending'
    },
    {
      id: 2,
      title: 'Kaynak Şema Yükle',
      description: 'order.created olayı için JSON şemasını yükleyin veya örnek payload yapıştırın.',
      route: '/studio',
      duration: '~45 sn',
      icon: 'pi pi-upload',
      status: 'pending'
    },
    {
      id: 3,
      title: 'Mapping Kuralları Tanımla',
      description: 'Canonical model alanlarını kaynak alanlara eşleyin, dönüşüm tiplerini seçin.',
      route: '/studio',
      duration: '~2 dak',
      icon: 'pi pi-objects-column',
      status: 'pending'
    },
    {
      id: 4,
      title: 'Canlı Önizleme & Test',
      description: 'Gerçek verilerle dönüşümü çalıştırın, diff görüntüleyicide sonucu doğrulayın.',
      route: '/studio',
      duration: '~45 sn',
      icon: 'pi pi-eye',
      status: 'pending'
    },
    {
      id: 5,
      title: 'Yayınla & İzle',
      description: 'Mapping\'i aktif ortama yayınlayın ve DLQ sayfasında mesajları izleyin.',
      route: '/dlq',
      duration: '~30 sn',
      icon: 'pi pi-send',
      status: 'pending'
    }
  ]);

  navigateToStep(step: DemoStep): void {
    if (step.route) this.router.navigate([step.route]);
  }

  async startDemo(): Promise<void> {
    this.running.set(true);
    this.resetStepStatuses();

    const stepDurations = [1200, 1800, 2500, 1800, 1200];
    const total = stepDurations.reduce((a, b) => a + b, 0);
    let elapsed = 0;

    for (let i = 0; i < this.steps().length; i++) {
      this.markStep(i, 'active');
      this.currentStepLabel.set(this.steps()[i].title);

      await this.sleep(stepDurations[i]);
      elapsed += stepDurations[i];
      this.progress.set(Math.round((elapsed / total) * 100));
      this.markStep(i, 'done');
    }

    this.running.set(false);
    this.currentStepLabel.set('');
    this.toast.add({
      severity: 'success',
      summary: 'Demo Tamamlandı!',
      detail: 'Tüm adımlar başarıyla yürütüldü. 🎉',
      life: 6000
    });
  }

  resetDemo(): void {
    this.running.set(false);
    this.progress.set(0);
    this.currentStepLabel.set('');
    this.resetStepStatuses();
  }

  statusLabel(status: DemoStep['status']): string {
    if (status === 'done') return 'Tamamlandı';
    if (status === 'active') return 'Devam ediyor';
    return 'Bekliyor';
  }

  statusSeverity(status: DemoStep['status']): 'success' | 'info' | 'secondary' {
    if (status === 'done') return 'success';
    if (status === 'active') return 'info';
    return 'secondary';
  }

  private markStep(index: number, status: DemoStep['status']): void {
    this.steps.update(steps =>
      steps.map((s, i) => i === index ? { ...s, status } : s)
    );
  }

  private resetStepStatuses(): void {
    this.steps.update(steps => steps.map(s => ({ ...s, status: 'pending' as const })));
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
