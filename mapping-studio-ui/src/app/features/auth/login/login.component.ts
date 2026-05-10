import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { MessageModule } from 'primeng/message';
import { DividerModule } from 'primeng/divider';
import { SelectModule } from 'primeng/select';
import { CardModule } from 'primeng/card';
import { AuthService } from '../../../core/services/auth.service';
import { I18nPipe } from '../../../core/i18n/i18n.pipe';

interface DemoAccount {
  label: string;
  email: string;
  password: string;
  roleLabel: string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    NgIf,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    MessageModule,
    DividerModule,
    SelectModule,
    CardModule,
    I18nPipe
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  email = '';
  password = '';
  loading = signal(false);
  errorKey = signal<string | null>(null);

  readonly demoAccounts: DemoAccount[] = [
    { label: 'Admin User', email: 'admin@canonbridge.io', password: 'admin123', roleLabel: 'admin' },
    { label: 'Integration Engineer', email: 'engineer@canonbridge.io', password: 'demo123', roleLabel: 'integration_author' },
    { label: 'Platform Operator', email: 'operator@canonbridge.io', password: 'demo123', roleLabel: 'operator' }
  ];

  selectedDemo: DemoAccount | null = null;

  constructor(private auth: AuthService, private router: Router) {}

  onDemoSelect(account: DemoAccount | null): void {
    if (!account) return;
    this.email = account.email;
    this.password = account.password;
    this.errorKey.set(null);
  }

  async onSubmit(): Promise<void> {
    if (!this.email || !this.password) {
      this.errorKey.set('auth.enterCredentials');
      return;
    }

    this.loading.set(true);
    this.errorKey.set(null);

    const result = await this.auth.login({ email: this.email, password: this.password });

    this.loading.set(false);

    if (result.success) {
      this.router.navigate(['/dashboard']);
    } else {
      this.errorKey.set(result.error ?? 'auth.invalidCredentials');
    }
  }
}
