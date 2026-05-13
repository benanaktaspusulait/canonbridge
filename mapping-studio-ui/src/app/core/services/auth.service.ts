import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { User, LoginCredentials } from '../models/user.model';
import { environment } from '../../../environments/environment';

interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    tenant_id: string;  // Backend uses snake_case
    tenant_name?: string;
  };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  
  private readonly STORAGE_KEY = 'cb_user';
  private readonly TOKEN_KEY = 'cb_token';

  private _currentUser = signal<User | null>(this.loadFromStorage());
  private _token = signal<string | null>(this.loadTokenFromStorage());

  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => this._currentUser() !== null);
  readonly userRole = computed(() => this._currentUser()?.role ?? null);

  async login(credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await firstValueFrom(
        this.http.post<LoginResponse>(`${environment.api.baseUrl}/auth/login`, credentials)
      );

      // Store token
      this._token.set(response.token);
      sessionStorage.setItem(this.TOKEN_KEY, response.token);

      // Create user object with avatar initials
      const user: User = {
        id: response.user.id,
        email: response.user.email,
        name: response.user.name,
        role: response.user.role as User['role'],
        tenantId: response.user.tenant_id,  // Map from snake_case to camelCase
        tenantName: response.user.tenant_name ?? this.formatTenantName(response.user.tenant_id),
        avatarInitials: this.getInitials(response.user.name)
      };

      this._currentUser.set(user);
      sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));

      return { success: true };
    } catch (error: any) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error?.error?.message || 'auth.invalidCredentials' 
      };
    }
  }

  logout(): void {
    this._currentUser.set(null);
    this._token.set(null);
    sessionStorage.removeItem(this.STORAGE_KEY);
    sessionStorage.removeItem(this.TOKEN_KEY);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this._token();
  }

  private loadFromStorage(): User | null {
    try {
      const raw = sessionStorage.getItem(this.STORAGE_KEY);
      return raw ? this.normalizeStoredUser(JSON.parse(raw)) : null;
    } catch {
      return null;
    }
  }

  private loadTokenFromStorage(): string | null {
    try {
      return sessionStorage.getItem(this.TOKEN_KEY);
    } catch {
      return null;
    }
  }

  private getInitials(name: string): string {
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  }

  private normalizeStoredUser(user: User): User {
    if (!user.tenantName || user.tenantName === 'Acme Corp') {
      user.tenantName = this.formatTenantName(user.tenantId);
      sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
    }

    return user;
  }

  private formatTenantName(tenantId: string): string {
    return tenantId
      .split(/[-_\s]+/)
      .filter(Boolean)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }
}
