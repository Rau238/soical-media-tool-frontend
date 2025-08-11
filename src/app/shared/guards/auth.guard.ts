import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { TokenService } from '../../core/services/token.service';

export const AuthGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const tokenService = inject(TokenService);

  // Debug logging
  const token = tokenService.getToken();
  const isAuthenticated = tokenService.isAuthenticated();

  console.log('🔍 AuthGuard Debug:', {
    hasToken: !!token,
    tokenLength: token?.length || 0,
    isAuthenticated,
    targetUrl: state.url,
    timestamp: new Date().toISOString()
  });

  // Check if user is authenticated
  if (isAuthenticated) {
    console.log('✅ User authenticated, allowing access to:', state.url);
    return true;
  }

  console.log('❌ User not authenticated, redirecting to login from:', state.url);

  // Prevent infinite redirects by checking if we're already on the login page
  if (state.url.startsWith('/auth/login')) {
    console.log('⚠️ Already on login page, preventing infinite redirect');
    return false;
  }

  // Store the intended destination for after login
  const returnUrl = state.url !== '/auth/login' && state.url !== '/auth/signup' && !state.url.startsWith('/auth')
    ? state.url
    : '/dashboard';

  console.log('🔄 Redirecting to login with returnUrl:', returnUrl);

  // Redirect to login page with return URL
  return router.createUrlTree(['/auth/login'], {
    queryParams: { returnUrl }
  });
};
