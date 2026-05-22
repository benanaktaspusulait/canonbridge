import { Routes } from '@angular/router';
import { authGuard, publicGuard } from './core/guards/auth.guard';

/**
 * Application Route Structure
 *
 * ┌─ /login ─────────────── LoginComponent (full-screen, no layout shell)
 * │
 * └─ / ──────────────────── LayoutComponent (sidebar + topbar + <router-outlet>)
 *    ├─ /dashboard
 *    ├─ /mappings
 *    ├─ /wizard
 *    ├─ /partners
 *    ├─ /schemas, /schemas/:id
 *    ├─ /external-systems
 *    ├─ /dlq
 *    ├─ /monitoring
 *    ├─ /audit
 *    ├─ /tenant
 *    └─ /settings
 *
 * Login uses its own full-screen layout (no sidebar/topbar).
 * All other routes are children of LayoutComponent which provides
 * the app shell (sidebar, topbar, skip-links, keyboard shortcuts).
 */
export const routes: Routes = [
  {
    path: 'login',
    canActivate: [publicGuard],
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layout/layout.component').then(m => m.LayoutComponent),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'mappings',
        loadComponent: () =>
          import('./pages/mappings/mappings.component').then(m => m.MappingsComponent)
      },
      {
        path: 'wizard',
        loadComponent: () =>
          import('./pages/mapping-wizard/mapping-wizard.component').then(
            m => m.MappingWizardComponent
          )
      },
      {
        path: 'partners',
        loadComponent: () =>
          import('./pages/partners/partners.component').then(m => m.PartnersComponent)
      },
      {
        path: 'schemas',
        loadComponent: () =>
          import('./pages/schemas/schemas.component').then(m => m.SchemasComponent)
      },
      {
        path: 'schemas/:id',
        loadComponent: () =>
          import('./pages/schemas/schema-detail/schema-detail.component').then(m => m.SchemaDetailComponent)
      },
      {
        path: 'external-systems',
        loadComponent: () =>
          import('./pages/external-systems/external-systems.component').then(
            m => m.ExternalSystemsComponent
          )
      },
      {
        path: 'dlq',
        loadComponent: () =>
          import('./pages/dlq/dlq.component').then(m => m.DlqComponent)
      },
      {
        path: 'monitoring',
        loadComponent: () =>
          import('./pages/monitoring/monitoring.component').then(m => m.MonitoringComponent)
      },
      {
        path: 'audit',
        loadComponent: () =>
          import('./pages/audit/audit.component').then(m => m.AuditComponent)
      },
      {
        path: 'tenant',
        loadComponent: () =>
          import('./pages/tenant/tenant.component').then(m => m.TenantComponent)
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./pages/settings/settings.component').then(m => m.SettingsComponent)
      },
      {
        path: 'billing',
        loadComponent: () =>
          import('./pages/billing/billing.component').then(m => m.BillingComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
