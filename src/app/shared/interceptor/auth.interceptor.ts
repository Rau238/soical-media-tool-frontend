import { Observable } from 'rxjs';
import { inject } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { TokenService } from '../../core/services/token.service';
import { environment } from '../../../environment/environment';
import { HttpRetryService } from '../services/http-retry.service';
import { HttpErrorHandlerService } from '../services/http-error-handler.service';
import { AUTH_CONFIG, HTTP_HEADERS, CONTENT_TYPES } from '../constants/http.constants';
import { HttpRequest, HttpErrorResponse, HttpHandlerFn, HttpEvent } from '@angular/common/http';


export const authInterceptor = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {

  const tokenService = inject(TokenService);
  const errorHandler = inject(HttpErrorHandlerService);
  const retryService = inject(HttpRetryService);

  const authenticatedRequest = addAuthenticationHeader(req, tokenService);
  // const retryConfig = retryService.getRetryConfigForRequest(authenticatedRequest);

  return next(authenticatedRequest).pipe(
    // retryService.createRetryOperator<HttpEvent<unknown>>(retryConfig),
    catchError((error: HttpErrorResponse) =>
      errorHandler.handleError(error, {
        showToast: shouldShowToast(req),
        logError: true,
        redirectOnUnauthorized: shouldRedirectOnUnauthorized(req)
      })
    )
  );
};

const addAuthenticationHeader = (request: HttpRequest<unknown>, tokenService: TokenService): HttpRequest<unknown> => {
  if (!shouldAddAuthHeader(request)) return request;
  const token = tokenService.getToken();
  if (!token) return request;

  return request.clone({
    setHeaders: {
      [HTTP_HEADERS.AUTHORIZATION]: `${AUTH_CONFIG.BEARER_PREFIX} ${token}`,
      [HTTP_HEADERS.CONTENT_TYPE]: getContentType(request),
      [HTTP_HEADERS.X_REQUESTED_WITH]: 'XMLHttpRequest'
    }
  });
};

const shouldAddAuthHeader = (request: HttpRequest<unknown>): boolean => {
  if (!request.url.startsWith(environment.apiUrl)) return false;
  const publicEndpoints = ['/auth/login', '/auth/register', '/auth/forgot-password'];
  return !publicEndpoints.some(endpoint => request.url.includes(endpoint));
};

const getContentType = (request: HttpRequest<unknown>): string => {
  if (request.body instanceof FormData) {
    return request.headers.get(HTTP_HEADERS.CONTENT_TYPE) ?? '';
  }
  return request.headers.get(HTTP_HEADERS.CONTENT_TYPE) ?? CONTENT_TYPES.JSON;
};


const shouldShowToast = (request: HttpRequest<unknown>): boolean => {
  const silentEndpoints = ['/health', '/ping', '/validate-token'];
  return !silentEndpoints.some(endpoint => request.url.includes(endpoint));
};

const shouldRedirectOnUnauthorized = (request: HttpRequest<unknown>): boolean => {
  const { SKIP_TOKEN_URLS } = AUTH_CONFIG; // Destructuring assignment
  return !SKIP_TOKEN_URLS.some(endpoint => request.url.includes(endpoint));
};
