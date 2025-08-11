import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { ToasterService } from './toaster.service';
import { Injectable, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { TokenService } from '../../core/services/token.service';
import { ErrorHandlerConfig } from '../interfaces/http-error.interface';
import { HTTP_ERROR_MESSAGES, AUTH_CONFIG } from '../constants/http.constants';

@Injectable({
  providedIn: 'root'
})
export class HttpErrorHandlerService {

  private readonly router = inject(Router);
  private readonly toasterService = inject(ToasterService);
  private readonly tokenService = inject(TokenService);

  handleError = (error: HttpErrorResponse, config: Partial<ErrorHandlerConfig> = {}): Observable<never> => {
    const finalConfig: ErrorHandlerConfig = {
      showToast: true,
      logError: true,
      redirectOnUnauthorized: true,
      returnUrl: this.router.url,
      ...config
    };

    const message = this.getErrorMessage(error);

    if (finalConfig.showToast) {
      this.toasterService.show(message, 'error', 5000);
    }

    this.handleSpecificErrors(error, finalConfig);

    throw new Error(message);
  };

  private getErrorMessage = (error: HttpErrorResponse): string => {
    // Extract API error message first
    const apiMessage = this.extractApiMessage(error);
    if (apiMessage) return apiMessage;

    // Handle network errors
    if (!error.status) return 'Network connection error. Please check your internet connection.';

    // Use predefined messages
    return HTTP_ERROR_MESSAGES[error.status as keyof typeof HTTP_ERROR_MESSAGES] ||
           HTTP_ERROR_MESSAGES.DEFAULT;
  };

  private extractApiMessage = (error: HttpErrorResponse): string | null => {
    try {
      const { error: errorBody } = error;
      return errorBody?.error?.message || errorBody?.message ||
             (typeof errorBody === 'string' ? errorBody : null);
    } catch {
      return null;
    }
  };

  private handleSpecificErrors = (error: HttpErrorResponse, config: ErrorHandlerConfig): void => {
    switch (error.status) {
      case 401:
        this.handleUnauthorized(error, config);
        break;
      case 403:
        this.router.navigate(['/forbidden']);
        break;
      case 404:
        this.router.navigate(['/not-found']);
        break;
      case 429:
        this.handleRateLimit(error);
        break;
    }
  };

  private handleUnauthorized = (error: HttpErrorResponse, config: ErrorHandlerConfig): void => {
    if (!config.redirectOnUnauthorized) return;

    // Skip redirect for specific URLs
    const shouldSkipRedirect = AUTH_CONFIG.SKIP_TOKEN_URLS
      .some(url => error.url?.includes(url));

    if (shouldSkipRedirect) return;

    // Clear tokens and redirect
    this.tokenService.clearToken();
    localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
    localStorage.removeItem(AUTH_CONFIG.REFRESH_TOKEN_KEY);

    const navigationExtras = config.returnUrl
      ? { queryParams: { returnUrl: config.returnUrl } }
      : {};

    this.router.navigate(['/login'], navigationExtras);
  };

  private handleRateLimit = (error: HttpErrorResponse): void => {
    const retryAfter = error.headers?.get('Retry-After');
    const message = retryAfter
      ? `Too many requests. Please wait ${retryAfter} seconds before trying again.`
      : 'Too many requests. Please wait a moment before trying again.';

    this.toasterService.show(message, 'warning', 7000);
  };
}
