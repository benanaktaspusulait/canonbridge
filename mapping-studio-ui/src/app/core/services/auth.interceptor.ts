import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const apiBase = environment.api.baseUrl;

  if (!req.url.startsWith(apiBase) && !req.url.startsWith('/api')) {
    return next(req);
  }

  const auth = inject(AuthService);
  const router = inject(Router);
  const user = auth.currentUser();
  const token = auth.getToken();

  // Skip auth for login endpoint
  if (req.url.includes('/auth/login')) {
    return next(req);
  }

  // Authentication is REQUIRED for all API calls
  if (!user || !token) {
    console.error('[AuthInterceptor] No authentication found, redirecting to login');
    router.navigate(['/login']);
    throw new Error('Authentication required');
  }

  // Validate tenant ID
  if (!user.tenantId) {
    console.error('[AuthInterceptor] User has no tenantId:', user);
    auth.logout();
    throw new Error('Invalid user session - missing tenant ID');
  }

  // Add authentication headers
  const cloned = req.clone({
    setHeaders: {
      'Authorization': `Bearer ${token}`,
      'X-Tenant-Id': user.tenantId,
      'X-User-Id': user.id
    }
  });

  console.log('[AuthInterceptor] Request headers:', {
    url: req.url,
    tenantId: user.tenantId,
    userId: user.id,
    hasToken: !!token
  });

  return next(cloned);
};
