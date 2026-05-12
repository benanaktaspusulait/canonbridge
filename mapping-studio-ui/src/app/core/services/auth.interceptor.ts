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

  if (!user) {
    return next(req);
  }

  const cloned = req.clone({
    setHeaders: {
      'X-Tenant-Id': user.tenantId,
      'X-User-Id': user.id
    }
  });

  return next(cloned);
};
