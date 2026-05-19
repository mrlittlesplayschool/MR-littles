import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const roleGuard: CanActivateFn = (route) => {
  const auth     = inject(AuthService);
  const router   = inject(Router);
  const required = route.data['role'];

  if (auth.getUserRole() === required) return true;

  // Wrong role — send back to dashboard overview
  router.navigate(['/dashboard/overview']);
  return false;
};