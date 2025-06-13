import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap, catchError, switchMap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { TokenService } from './token.service';
import { User } from '../models/user.model';

interface ResponseData extends MessageResponse{
  success: boolean;
  data: {
    _id: string;
    name: string;
    email: string;
    token: string;
  };
}

interface MessageResponse  {
  success?: boolean;
  message?: string;
}



@Injectable({
  providedIn: 'root',
})
export class UserAuthService {
  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();

  constructor(
    private apiService: ApiService,
    private tokenService: TokenService
  ) {
    // Check for existing token and fetch user on app initialization
    this.tokenService.token$.subscribe((token) => {
      if (token) {
        this.getCurrentUser().subscribe({
          next: (user) => this.userSubject.next(user),
          error: () => this.logout(),
        });
      } else {
        this.userSubject.next(null);
      }
    });
  }

  signup(name: string, email: string, password: string): Observable<ResponseData> {
    return this.apiService.post<ResponseData>('/api/v1/auth/register', { name, email, password }, false).pipe(
      tap((response) => {
        this.tokenService.setToken(response.data.token);
        this.userSubject.next({_id: response.data._id,name: response.data.name,email: response.data.email,});
      })
    );
  }

  login(email: string, password: string): Observable<ResponseData> {
    return this.apiService.post<ResponseData>('/api/v1/auth/login', { email, password }, false).pipe(
      tap((response) => {
        this.tokenService.setToken(response.data.token);
        this.userSubject.next({_id: response.data._id,name: response.data.name,email: response.data.email,});
      })
    );
  }

  googleLogin(code: string): Observable<ResponseData> {
    return this.apiService.post<ResponseData>('/api/v1/auth/google', { code }, false).pipe(
      tap((response) => {
        this.tokenService.setToken(response.data.token);
        this.userSubject.next({_id: response.data._id,name: response.data.name,email: response.data.email,});
      })
    );
  }

  forgotPassword(email: string): Observable<ResponseData> {
    return this.apiService.post<ResponseData>('/api/v1/auth/forgot-password', { email }, false);
  }

  resetPassword(resettoken: string, password: string): Observable<ResponseData> {
    return this.apiService.post<ResponseData>(`/api/v1/auth/reset-password/${resettoken}`, { password }, false).pipe(
      tap((response) => {
        this.tokenService.setToken(response.data.token);
        this.userSubject.next({_id: response.data._id,name: response.data.name,email: response.data.email,});
      })
    );
  }

  getCurrentUser(): Observable<User> {
    return this.apiService.get<{ success: boolean; data: User }>('/api/v1/auth/profile').pipe(
      tap((response) => this.userSubject.next(response.data)),
      switchMap((response) => of(response.data))
    );
  }

  logout(): void {
    this.tokenService.clearToken();
    this.userSubject.next(null);
  }
}
