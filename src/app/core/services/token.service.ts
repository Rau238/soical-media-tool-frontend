import { BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';
import { AUTH_CONFIG } from '../../shared/constants/http.constants';

@Injectable({ providedIn: 'root' })
export class TokenService {
  private readonly tokenSubject = new BehaviorSubject<string | null>(null);

  readonly token$ = this.tokenSubject.asObservable();

  constructor() {
    const storedToken = this.getStoredToken();
    if (storedToken) {
      this.tokenSubject.next(storedToken);
    }
  }

  setToken = (token: string): void => {
    console.log('🔍 TokenService: setToken called with:', {
      token: token ? `${token.substring(0, 20)}...` : 'null/undefined',
      type: typeof token,
      length: token?.length || 0
    });

    if (!token?.trim()) {
      console.warn('🔴 TokenService: Attempted to set empty token');
      return;
    }
    this.safeStorage(() => {
      localStorage.setItem(AUTH_CONFIG.TOKEN_KEY, token);
      this.tokenSubject.next(token);
      console.log('✅ TokenService: Token set successfully', {
        tokenLength: token.length,
        isAuthenticated: this.isAuthenticated()
      });
    });
  };

  getToken = (): string | null => this.tokenSubject.value;

  clearToken = (): void => {
    this.safeStorage(() => {
      localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
      localStorage.removeItem(AUTH_CONFIG.REFRESH_TOKEN_KEY);
      this.tokenSubject.next(null);
    });
  };

  isAuthenticated = (): boolean => {
    const token = this.getToken();
    const isValid = !!token && !this.isExpired(token);
    console.log('🔍 TokenService: isAuthenticated check', {
      hasToken: !!token,
      tokenLength: token?.length || 0,
      isExpired: token ? this.isExpired(token) : 'N/A',
      isValid
    });
    return isValid;
  };

  // Refresh token operations
  setRefreshToken = (refreshToken: string): void => {
    if (!refreshToken?.trim()) return;
    this.safeStorage(() => localStorage.setItem(AUTH_CONFIG.REFRESH_TOKEN_KEY, refreshToken));
  };

  getRefreshToken = (): string | null =>
    this.safeStorage(() => localStorage.getItem(AUTH_CONFIG.REFRESH_TOKEN_KEY)) ?? null;

  getTokenPayload = (): Record<string, any> | null => {
    const token = this.getToken();
    return token ? this.decodePayload(token) : null;
  };

  getUserId = (): string | null => this.getTokenPayload()?.['sub'] || null;

  getTokenExpiry = (): Date | null => {
    const exp = this.getTokenPayload()?.['exp'];
    return exp ? new Date(exp * 1000) : null;
  };

  // Authorization header for OpenAPI requests
  getAuthorizationHeader = (): Record<string, string> => {
    const token = this.getToken();
    return token ? { Authorization: `${AUTH_CONFIG.BEARER_PREFIX} ${token}` } : {};
  };

  private getStoredToken = (): string | null =>
    this.safeStorage(() => localStorage.getItem(AUTH_CONFIG.TOKEN_KEY)) ?? null;

  private isExpired = (token: string): boolean => {
    const payload = this.decodePayload(token);
    return payload?.['exp'] ? Math.floor(Date.now() / 1000) >= payload['exp'] : true;
  };

  private decodePayload = (token: string): Record<string, any> | null => {
    try {
      const [, payload] = token.split('.');
      if (!payload) return null;
      const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decoded);
    } catch {
      return null;
    }
  };

  private safeStorage = <T>(operation: () => T): T | undefined => {
    try {
      return operation();
    } catch (error) {
      console.error('Storage operation failed:', error);
      return undefined;
    }
  };
}
