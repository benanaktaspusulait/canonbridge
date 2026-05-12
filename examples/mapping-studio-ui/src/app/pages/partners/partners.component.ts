import { Component } from '@angular/core';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-partners',
  standalone: true,
  imports: [CardModule, ButtonModule],
  template: `
    <div class="page-header">
      <div>
        <h1 class="page-title">Partners</h1>
        <p class="page-subtitle">Manage partner integrations and their configurations.</p>
      </div>
      <p-button label="Onboard Partner" icon="pi pi-plus" />
    </div>
    <p-card>
      <div class="placeholder-content">
        <i class="pi pi-building placeholder-icon"></i>
        <h3>Partners Screen — Coming Soon</h3>
        <p>Partner list, health status, active mappings, and onboarding flow.</p>
      </div>
    </p-card>
  `,
  styles: [`
    .page-header { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:1.5rem; gap:1rem; }
    .page-title { font-size:1.5rem; font-weight:700; margin:0 0 .25rem; }
    .page-subtitle { font-size:.875rem; color:var(--text-color-secondary); margin:0; }
    .placeholder-content { display:flex; flex-direction:column; align-items:center; padding:3rem; gap:1rem; text-align:center; }
    .placeholder-icon { font-size:3rem; color:var(--text-color-secondary); opacity:.4; }
    h3 { margin:0; } p { margin:0; color:var(--text-color-secondary); }
  `]
})
export class PartnersComponent {}
