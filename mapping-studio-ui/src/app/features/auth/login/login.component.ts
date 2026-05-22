import { Component, inject, signal } from '@angular/core';
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
import { environment } from '../../../../environments/environment';

interface DemoAccount {
  label: string;
  email: string;
  password?: string;
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
  private readonly auth = inject(AuthService);

  email = '';
  password = '';
  loading = signal(false);
  errorKey = signal<string | null>(null);

  readonly demoAccounts: DemoAccount[] = environment.auth.demoAccounts;
  readonly tenant = this.auth.currentTenant;

  selectedDemo: DemoAccount | null = null;

  // [L3] Client-side throttling to complement backend rate limiting
  private failedAttempts = 0;
  private lockoutUntil = 0;
  private readonly MAX_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION_MS = 30_000; // 30 seconds

  constructor(private router: Router) {}

  onDemoSelect(account: DemoAccount | null): void {
    if (!account) return;
    this.email = account.email;
    this.password = account.password ?? '';
    this.errorKey.set(null);
  }

  async onSubmit(): Promise<void> {
    if (!this.email || !this.password) {
      this.errorKey.set('auth.enterCredentials');
      return;
    }

    // Check client-side lockout
    if (this.failedAttempts >= this.MAX_ATTEMPTS) {
      const remaining = this.lockoutUntil - Date.now();
      if (remaining > 0) {
        const seconds = Math.ceil(remaining / 1000);
        this.errorKey.set(`auth.tooManyAttempts`);
        return;
      }
      // Lockout expired, reset
      this.failedAttempts = 0;
    }

    this.loading.set(true);
    this.errorKey.set(null);

    const result = await this.auth.login({ email: this.email, password: this.password });

    this.loading.set(false);

    if (result.success) {
      this.failedAttempts = 0;
      this.router.navigate(['/dashboard']);
    } else {
      this.failedAttempts++;
      if (this.failedAttempts >= this.MAX_ATTEMPTS) {
        this.lockoutUntil = Date.now() + this.LOCKOUT_DURATION_MS;
        this.errorKey.set('auth.tooManyAttempts');
      } else {
        this.errorKey.set(result.error ?? 'auth.invalidCredentials');
      }
    }
  }
}
