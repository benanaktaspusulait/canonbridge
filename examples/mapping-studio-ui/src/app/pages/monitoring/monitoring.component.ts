import { Component } from '@angular/core';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-monitoring',
  standalone: true,
  imports: [CardModule],
  template: `
    <div class="page-header">
      <div>
        <h1 class="page-title">Monitoring</h1>
        <p class="page-subtitle">Real-time metrics, consumer lag, and transformation performance.</p>
      </div>
    </div>
    <p-card>
      <div class="placeholder-content">
        <i class="pi pi-chart-line placeholder-icon"></i>
        <h3>Monitoring Screen — Coming Soon</h3>
        <p>Charts for throughput, DLQ rate, p99 latency, consumer lag, and partner health.</p>
      </div>
    </p-card>
  `,
  styles: [`
    .page-header { margin-bottom:1.5rem; }
    .page-title { font-size:1.5rem; font-weight:700; margin:0 0 .25rem; }
    .page-subtitle { font-size:.875rem; color:var(--text-color-secondary); margin:0; }
    .placeholder-content { display:flex; flex-direction:column; align-items:center; padding:3rem; gap:1rem; text-align:center; }
    .placeholder-icon { font-size:3rem; color:var(--text-color-secondary); opacity:.4; }
    h3 { margin:0; } p { margin:0; color:var(--text-color-secondary); }
  `]
})
export class MonitoringComponent {}
