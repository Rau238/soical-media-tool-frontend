// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from 'src/environment/environment';

export interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  };
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    // Check if user is already logged in
    const token = this.getToken();
    if (token) {
      // You might want to validate the token here
      this.currentUserSubject.next({ token });
    }
  }

  /**
   * Register new user
   */
  register(userData: RegisterData): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${environment.apiUrl}${environment.apiEndpoints.auth}/register`,
      userData
    ).pipe(
      map(response => {
        if (response.success && response.data?.token) {
          this.setToken(response.data.token);
          this.currentUserSubject.next(response.data);
        }
        return response;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Login user
   */
  login(credentials: LoginData): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${environment.apiUrl}${environment.apiEndpoints.auth}/login`,
      credentials
    ).pipe(
      map(response => {
        if (response.success && response.data?.token) {
          this.setToken(response.data.token);
          this.currentUserSubject.next(response.data);
        }
        return response;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Logout user
   */
  logout(): Observable<any> {
    return this.http.post(
      `${environment.apiUrl}${environment.apiEndpoints.auth}/logout`,
      {},
      { headers: this.getAuthHeaders() }
    ).pipe(
      map(response => {
        this.removeToken();
        this.currentUserSubject.next(null);
        return response;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Get current user profile
   */
  getProfile(): Observable<any> {
    return this.http.get(
      `${environment.apiUrl}${environment.apiEndpoints.users}/profile`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    // Check if token is expired (basic check)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp > currentTime;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get JWT token from localStorage
   */
  getToken(): string | null {
    return localStorage.getItem('jwt_token') || localStorage.getItem('token');
  }

  /**
   * Set JWT token in localStorage
   */
  private setToken(token: string): void {
    localStorage.setItem('jwt_token', token);
  }

  /**
   * Remove JWT token from localStorage
   */
  private removeToken(): void {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('token');
  }

  /**
   * Get authorization headers
   */
  private getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: any): Observable<never> {
    console.error('Auth Service Error:', error);

    let errorMessage = 'An unknown error occurred';

    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      errorMessage = error.error?.message || error.message || `Error Code: ${error.status}`;
    }

    throw new Error(errorMessage);
  }
}
