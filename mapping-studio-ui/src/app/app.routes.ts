import { Routes } from '@angular/router';
import { authGuard, publicGuard } from './core/guards/auth.guard';

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
        path: 'studio',
        loadComponent: () =>
          import('./pages/integration-studio/integration-studio.component').then(
            m => m.IntegrationStudioComponent
          )
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
        path: 'settings',
        loadComponent: () =>
          import('./pages/settings/settings.component').then(m => m.SettingsComponent)
      },
      {
        path: 'demo',
        loadComponent: () =>
          import('./pages/demo/demo.component').then(m => m.DemoComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
