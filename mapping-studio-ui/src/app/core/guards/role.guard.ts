import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * A-V8-H3 FIX: Role-based route guard.
 * Restricts access to routes based on the user's role.
 * Usage: canActivate: [roleGuard('admin', 'operator')]
 */
export function roleGuard(...allowedRoles: string[]): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const user = auth.currentUser();

    if (!user) {
      return router.createUrlTree(['/login']);
    }

    if (allowedRoles.includes(user.role)) {
      return true;
    }

    // User doesn't have the required role — redirect to dashboard
    return router.createUrlTree(['/dashboard']);
  };
}
