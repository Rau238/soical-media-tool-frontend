import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { TokenService } from '../../core/services/token.service';

export const AuthGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = inject(TokenService).getToken();

  if (token) {
    console.log('Token found, allowing access');
    return true;
  }

  console.log('No token found, redirecting to login');
  return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};
