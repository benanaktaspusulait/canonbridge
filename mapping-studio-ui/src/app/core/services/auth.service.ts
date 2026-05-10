import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { User, LoginCredentials } from '../models/user.model';

// Demo users — replace with real API calls later
const DEMO_USERS: (User & { password: string })[] = [
  {
    id: 'usr-001',
    name: 'Admin User',
    email: 'admin@canonbridge.io',
    password: 'admin123',
    role: 'admin',
    tenantId: 'tenant-acme',
    tenantName: 'Acme Corp',
    avatarInitials: 'AU'
  },
  {
    id: 'usr-002',
    name: 'Integration Engineer',
    email: 'engineer@canonbridge.io',
    password: 'demo123',
    role: 'integration_author',
    tenantId: 'tenant-acme',
    tenantName: 'Acme Corp',
    avatarInitials: 'IE'
  },
  {
    id: 'usr-003',
    name: 'Platform Operator',
    email: 'operator@canonbridge.io',
    password: 'demo123',
    role: 'operator',
    tenantId: 'tenant-acme',
    tenantName: 'Acme Corp',
    avatarInitials: 'PO'
  }
];

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly STORAGE_KEY = 'cb_user';

  private _currentUser = signal<User | null>(this.loadFromStorage());

  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => this._currentUser() !== null);
  readonly userRole = computed(() => this._currentUser()?.role ?? null);

  constructor(private router: Router) {}

  login(credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> {
    // Simulate async API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const match = DEMO_USERS.find(
          u => u.email === credentials.email && u.password === credentials.password
        );
        if (match) {
          const { password: _, ...user } = match;
          this._currentUser.set(user);
          sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
          resolve({ success: true });
        } else {
          resolve({ success: false, error: 'Invalid email or password.' });
        }
      }, 600); // simulate network delay
    });
  }

  logout(): void {
    this._currentUser.set(null);
    sessionStorage.removeItem(this.STORAGE_KEY);
    this.router.navigate(['/login']);
  }

  private loadFromStorage(): User | null {
    try {
      const raw = sessionStorage.getItem(this.STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}
