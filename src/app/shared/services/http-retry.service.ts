import { Injectable } from '@angular/core';
import { HttpRequest, HttpErrorResponse, HttpEvent } from '@angular/common/http';
import { Observable, throwError, timer } from 'rxjs';
import { retry } from 'rxjs/operators';

export interface RetryConfig {
  maxRetries: number;
  delayMs: number;
  exponentialBackoff: boolean;
  retryableStatusCodes: number[];
  maxDelayMs: number;
}

@Injectable({
  providedIn: 'root'
})
export class HttpRetryService {

  private readonly defaultConfig: RetryConfig = {
    maxRetries: 3,
    delayMs: 1000,
    exponentialBackoff: true,
    retryableStatusCodes: [408, 429, 500, 502, 503, 504],
    maxDelayMs: 30000
  };

  createRetryOperator = <T>(config: Partial<RetryConfig> = {}) => {
    const finalConfig = { ...this.defaultConfig, ...config };
    return retry<T>({
      count: finalConfig.maxRetries, delay: (error: any, retryCount: number) => {
        if (!(error instanceof HttpErrorResponse) || !this.shouldRetry(error, finalConfig)) {
          return throwError(() => error);
        }
        const delayMs = this.calculateDelay(finalConfig.delayMs, retryCount, finalConfig);
        return timer(delayMs);
      },
      resetOnSuccess: true
    });
  };


  createSimpleRetry = <T>(maxRetries: number = 3, delayMs: number = 1000) =>
    retry<T>({ count: maxRetries, delay: delayMs, resetOnSuccess: true });

  createRateLimitRetry = <T>(maxRetries: number = 3) =>
    retry<T>({
      count: maxRetries,
      delay: (error: any, retryCount: number) => {
        if (!(error instanceof HttpErrorResponse) || error.status !== 429) {
          return throwError(() => error);
        }
        const retryAfterHeader = error.headers?.get('Retry-After');
        const delayMs = retryAfterHeader
          ? parseInt(retryAfterHeader, 10) * 1000
          : 1000 * Math.pow(2, retryCount - 1);
        return timer(delayMs);
      },
      resetOnSuccess: true
    });

  getRetryConfigForRequest = (request: HttpRequest<any>): Partial<RetryConfig> => {
    const { method, url } = request;
    if (method === 'POST' && request.body instanceof FormData) {
      return { maxRetries: 0 };
    }
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
      return { maxRetries: 1, exponentialBackoff: false };
    }
    return this.defaultConfig;
  };

  private shouldRetry = (error: HttpErrorResponse, config: RetryConfig): boolean => {
    if (error.status === 401 || error.status === 403) return false;
    if (error.status >= 400 && error.status < 500 &&
      error.status !== 408 && error.status !== 429) return false;
    return config.retryableStatusCodes.includes(error.status);
  };

  private calculateDelay = (baseDelay: number, attempt: number, config: RetryConfig): number => {
    let delay = config.exponentialBackoff
      ? baseDelay * Math.pow(2, attempt - 1)
      : baseDelay;
    delay += Math.random() * 0.1 * delay;
    return Math.min(delay, config.maxDelayMs);
  };
}
