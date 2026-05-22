import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { throwError, EMPTY } from 'rxjs';
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

  // Skip auth for login endpoint — use exact path segment match to avoid
  // accidentally skipping auth for URLs that merely contain the substring.
  const url = new URL(req.url, window.location.origin);
  if (url.pathname.endsWith('/auth/login')) {
    return next(req);
  }

  // [H4] Return proper Observable error instead of throwing synchronously
  if (!user || !token) {
    router.navigate(['/login']);
    return throwError(() => new HttpErrorResponse({
      status: 401,
      statusText: 'Authentication required'
    }));
  }

  // Validate tenant ID
  if (!user.tenantId) {
    auth.logout();
    return throwError(() => new HttpErrorResponse({
      status: 401,
      statusText: 'Invalid user session - missing tenant ID'
    }));
  }

  // [H2] Only send Authorization header — tenant/user identity must be
  // derived from the JWT on the backend, not from client-supplied headers.
  const cloned = req.clone({
    setHeaders: {
      'Authorization': `Bearer ${token}`
    }
  });

  return next(cloned);
};
