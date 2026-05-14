import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const apiBase = environment.api.baseUrl;

  if (!req.url.startsWith(apiBase)) {
    return next(req);
  }

  const auth = inject(AuthService);
  const user = auth.currentUser();
  const token = auth.getToken();

  // Skip auth for login endpoint
  if (req.url.includes('/auth/login')) {
    return next(req);
  }

  if (!user || !token) {
    console.warn('[AuthInterceptor] No user or token found for request:', req.url);
    console.warn('[AuthInterceptor] User:', user, 'Token:', token ? 'present' : 'missing');
    return next(req);
  }

  if (!user.tenantId) {
    console.error('[AuthInterceptor] User has no tenantId:', user);
  }

  const cloned = req.clone({
    setHeaders: {
      'Authorization': `Bearer ${token}`,
      'X-Tenant-Id': user.tenantId,
      'X-User-Id': user.id
    }
  });

  return next(cloned);
};
