import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { TokenService } from '../../core/services/token.service';

export const GuestGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const tokenService = inject(TokenService);

  const isAuthenticated = tokenService.isAuthenticated();
  console.log('🔍 GuestGuard Debug:', {
    isAuthenticated,
    targetUrl: state.url,
    timestamp: new Date().toISOString()
  });

  if (isAuthenticated) {
    console.log('✅ User already authenticated, redirecting to dashboard');
    return router.createUrlTree(['/dashboard']);
  }

  console.log('✅ User not authenticated, allowing access to auth page:', state.url);
  return true;
};
