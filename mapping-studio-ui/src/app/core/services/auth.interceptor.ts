import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

/**
 * Default tenant ID for development when no user is logged in
 * This allows testing API endpoints without authentication
 * Using 'tenant-acme' which has test data in the database
 */
const DEV_DEFAULT_TENANT_ID = 'tenant-acme';
const DEV_DEFAULT_USER_ID = 'dev-user';

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

  // If user is logged in, use their credentials
  if (user && token) {
    if (!user.tenantId) {
      console.error('[AuthInterceptor] User has no tenantId:', user);
    }

    const cloned = req.clone({
      setHeaders: {
        'Authorization': `Bearer ${token}`,
        'X-Tenant-Id': user.tenantId || DEV_DEFAULT_TENANT_ID,
        'X-User-Id': user.id
      }
    });

    return next(cloned);
  }

  // In development mode, use default tenant/user IDs when not logged in
  if (!environment.production) {
    console.warn('[AuthInterceptor] No user logged in, using dev defaults for:', req.url);
    
    const cloned = req.clone({
      setHeaders: {
        'X-Tenant-Id': DEV_DEFAULT_TENANT_ID,
        'X-User-Id': DEV_DEFAULT_USER_ID
      }
    });

    return next(cloned);
  }

  // In production, don't add headers if not authenticated
  console.warn('[AuthInterceptor] No user or token found for request:', req.url);
  return next(req);
};
