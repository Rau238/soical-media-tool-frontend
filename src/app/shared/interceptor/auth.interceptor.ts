import { inject } from '@angular/core';
import { HttpRequest, HttpErrorResponse, HttpHandlerFn } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { TokenService } from '../../core/services/token.service';
import { environment } from '../../../environment/environment';

export function authInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn) {

  const router = inject(Router);
  const token = inject(TokenService).getToken();

  let authReq = req;

  if (token && req.url.startsWith(environment.apiUrl)) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  }
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An unexpected error occurred';
      if (!error.status && error.statusText === 'Unknown Error') {
        errorMessage = 'No network connection. Please check your internet.';
        console.error(errorMessage);
      } else {
        switch (error.status) {
          case 400:
            errorMessage = 'Bad Request: Please check your input.';
            break;
          case 401:
            case 401:
            errorMessage = 'Unauthorized: Please log in again.';
            if (!req.url.includes('/validate-token')) {
              localStorage.removeItem('access_token');
              router.navigate(['/login'], {
                queryParams: { returnUrl: router.url }
              });
            }
            break;
          case 403:
            errorMessage = 'Forbidden: You do not have access.';
            router.navigate(['/forbidden']);
            break;
          case 404:
            errorMessage = 'Resource not found.';
            break;
          case 500:
            errorMessage = 'Server error. Please try again later.';
            break;
        }
      }
      console.error('HTTP Error:', error);
      return throwError(() => new Error(errorMessage));
    })
  );

}