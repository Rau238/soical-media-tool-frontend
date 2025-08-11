import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environment/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  private getHeaders(includeToken: boolean = true): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    if (includeToken) {
      const token = localStorage.getItem('jwt_token');
      if (token) {
        headers = headers.set('Authorization', `Bearer ${token}`);
      }
    }

    return headers;
  }

  post<T>(url: string, body: any, includeToken: boolean = true): Observable<T> {
    return this.http
      .post<T>(`${this.baseUrl}${url}`, body, { headers: this.getHeaders(includeToken) })
      .pipe(catchError(this.handleError));
  }

  put<T>(url: string, body: any, includeToken: boolean = true): Observable<T> {
    return this.http
      .put<T>(`${this.baseUrl}${url}`, body, { headers: this.getHeaders(includeToken) })
      .pipe(catchError(this.handleError));
  }

  get<T>(url: string): Observable<T> {
    return this.http
      .get<T>(`${this.baseUrl}${url}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  delete<T>(url: string): Observable<T> {
    return this.http
      .delete<T>(`${this.baseUrl}${url}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any): Observable<never> {
    const errorMessage = error.error?.message || 'Server Error';
    return throwError(() => new Error(errorMessage));
  }
}
