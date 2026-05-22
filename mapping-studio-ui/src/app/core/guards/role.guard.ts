import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { User } from '../models/user.model';

/**
 * Factory that creates a route guard restricting access to specific roles.
 * Usage in routes:
 *   canActivate: [roleGuard('admin', 'operator')]
 */
export function roleGuard(...allowedRoles: User['role'][]): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    const role = auth.userRole();

    if (role && allowedRoles.includes(role)) {
      return true;
    }

    // Redirect unauthorized users to dashboard with a hint
    return router.createUrlTree(['/dashboard']);
  };
}
