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
    const cloned = req.clone({
      setHeaders: {
        'X-API-Key': auth.apiKey,
        'X-Tenant-Id': 'tenant-acme',
        'X-User-Id': 'anonymous'
      }
    });
    return next(cloned);
  }

  const cloned = req.clone({
    setHeaders: {
      'X-API-Key': auth.apiKey,
      'Authorization': `Bearer ${token}`,
      'X-Tenant-Id': user.tenantId,
      'X-User-Id': user.id
    }
  });

  return next(cloned);
};
