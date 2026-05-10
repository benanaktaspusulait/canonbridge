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
import { AuthService } from '../../../core/services/auth.service';

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
    RouterLink,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    MessageModule,
    DividerModule,
    SelectModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  email = '';
  password = '';
  loading = signal(false);
  errorMessage = signal('');

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
    this.errorMessage.set('');
  }

  async onSubmit(): Promise<void> {
    if (!this.email || !this.password) {
      this.errorMessage.set('Please enter your email and password.');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    const result = await this.auth.login({ email: this.email, password: this.password });

    this.loading.set(false);

    if (result.success) {
      this.router.navigate(['/dashboard']);
    } else {
      this.errorMessage.set(result.error ?? 'Login failed. Please try again.');
    }
  }
}
