import { Component } from '@angular/core';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-dlq',
  standalone: true,
  imports: [CardModule, ButtonModule],
  template: `
    <div class="page-header">
      <div>
        <h1 class="page-title">Dead Letter Queue</h1>
        <p class="page-subtitle">Investigate and replay failed messages.</p>
      </div>
      <p-button label="Redrive All" icon="pi pi-refresh" severity="warning" variant="outlined" />
    </div>
    <p-card>
      <div class="placeholder-content">
        <i class="pi pi-exclamation-triangle placeholder-icon"></i>
        <h3>DLQ Screen — Coming Soon</h3>
        <p>DLQ message list with error details, masked payload preview, and redrive controls.</p>
      </div>
    </p-card>
  `,
  styles: [`
    .page-header { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:1.5rem; gap:1rem; }
    .page-title { font-size:1.5rem; font-weight:700; margin:0 0 .25rem; }
    .page-subtitle { font-size:.875rem; color:var(--text-color-secondary); margin:0; }
    .placeholder-content { display:flex; flex-direction:column; align-items:center; padding:3rem; gap:1rem; text-align:center; }
    .placeholder-icon { font-size:3rem; color:var(--red-400); opacity:.6; }
    h3 { margin:0; } p { margin:0; color:var(--text-color-secondary); }
  `]
})
export class DlqComponent {}
