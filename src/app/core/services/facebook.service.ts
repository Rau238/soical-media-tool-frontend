import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environment/environment';

declare var FB: any;

export interface FacebookLoginResponse {
  authResponse: {
    accessToken: string;
    userID: string;
    expiresIn: number;
    signedRequest: string;
  };
  status: string;
}

export interface SocialAccountResponse {
  success: boolean;
  message: string;
  data?: {
    id: string;
    accountId: string;
    name: string;
    platform: string;
    accountName: string;
    accountUsername: string;
    accountProfilePic: string;
    isActive: boolean;
    tokenExpiry: string;
    tokenValidationStatus: string;
    lastTokenValidation: string;
    createdAt: string;
    updatedAt: string;
    pages?: any[];
    permissions?: string[];
  };
}

export interface TokenValidationResponse {
  success: boolean;
  message: string;
  data?: {
    isValid: boolean;
    tokenExpiry?: string;
    error?: string;
  };
}

export interface TokenRefreshResponse {
  success: boolean;
  message: string;
  data?: {
    newToken: string;
    tokenExpiry: string;
  };
}

export interface CreateFacebookPostRequest {
  message?: string;
  link?: string;
  imageUrl?: string;
}

export interface CreateInstagramPostRequest {
  imageUrl: string;
  caption?: string;
}

export interface CreatePostResponse {
  success: boolean;
  message: string;
  data: any;
}

export interface ListFacebookPostsResponse {
  success: boolean;
  message: string;
  data: { posts: any; page: { id: string; name: string } };
}

export interface ListInstagramMediaResponse {
  success: boolean;
  message: string;
  data: { media: any; instagram: { id: string } };
}

@Injectable({
  providedIn: 'root'
})
export class FacebookService {
  private isSDKLoaded = false;
  private sdkPromise: Promise<void>;

  constructor(private http: HttpClient) {
    this.sdkPromise = this.loadFacebookSDK();
  }

  /**
   * Load Facebook SDK
   */
  private loadFacebookSDK(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isSDKLoaded) {
        resolve();
        return;
      }

      // Add Facebook SDK script
      const script = document.createElement('script');
      script.src = 'https://connect.facebook.net/en_US/sdk.js';
      script.async = true;
      script.defer = true;
      script.crossOrigin = 'anonymous';

      script.onload = () => {
        // Initialize Facebook SDK
        (window as any).fbAsyncInit = () => {
          FB.init({
            appId: environment.oauth.facebook.appId,
            cookie: true,
            xfbml: true,
            version: 'v23.0'
          });

          this.isSDKLoaded = true;
          resolve();
        };
      };

      script.onerror = () => {
        reject(new Error('Failed to load Facebook SDK'));
      };

      document.head.appendChild(script);
    });
  }

  /**
   * Check if Facebook SDK is ready
   */
  private async ensureSDKReady(): Promise<void> {
    await this.sdkPromise;
    return new Promise((resolve) => {
      if (this.isSDKLoaded && typeof FB !== 'undefined') {
        resolve();
      } else {
        setTimeout(() => this.ensureSDKReady().then(resolve), 100);
      }
    });
  }

  /**
   * Login to Facebook and get access token
   */
  async loginToFacebook(): Promise<FacebookLoginResponse> {
    await this.ensureSDKReady();

    return new Promise((resolve, reject) => {
      FB.login((response: FacebookLoginResponse) => {
        if (response.authResponse) {
          resolve(response);
        } else {
          reject(new Error('User cancelled login or did not fully authorize.'));
        }
      }, {
        scope: 'pages_manage_posts,pages_read_engagement,pages_show_list,public_profile'
      });
    });
  }

  /**
   * Get Facebook login status
   */
  async getLoginStatus(): Promise<FacebookLoginResponse> {
    await this.ensureSDKReady();

    return new Promise((resolve, reject) => {
      FB.getLoginStatus((response: FacebookLoginResponse) => {
        resolve(response);
      });
    });
  }

  /**
   * Logout from Facebook
   */
  async logoutFromFacebook(): Promise<void> {
    await this.ensureSDKReady();

    return new Promise((resolve) => {
      FB.logout(() => {
        resolve();
      });
    });
  }

  /**
   * Connect Facebook account to backend
   */
  connectFacebookAccount(accessToken: string, userID: string): Observable<SocialAccountResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.getJWTToken()}`
    });

    const body = {
      accessToken,
      userID
    };

    return this.http.post<SocialAccountResponse>(
      `${environment.apiUrl}${environment.apiEndpoints.socialAccounts}/connect/facebook`,body,{ headers }
    ).pipe(catchError(this.handleError));
  }

  /**
   * Get connected social accounts
   * @desc    Get all connected social accounts for user
   * @route   GET /api/social-accounts
   * @access  Private
   */
  getSocialAccounts(): Observable<SocialAccountResponse[]> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.getJWTToken()}`
    });

    return this.http.get<SocialAccountResponse[]>(
      `${environment.apiUrl}${environment.apiEndpoints.socialAccounts}`,
      { headers }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get single social account
   * @desc    Get single social account
   * @route   GET /api/social-accounts/:id
   * @access  Private
   */
  getSingleSocialAccount(accountId: string): Observable<SocialAccountResponse> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.getJWTToken()}`
    });

    return this.http.get<SocialAccountResponse>(
      `${environment.apiUrl}${environment.apiEndpoints.socialAccounts}/${accountId}`,
      { headers }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Disconnect social account
   * @desc    Disconnect social account
   * @route   DELETE /api/social-accounts/:id
   * @access  Private
   */
  disconnectSocialAccount(accountId: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.getJWTToken()}`
    });

    return this.http.delete(
      `${environment.apiUrl}${environment.apiEndpoints.socialAccounts}/${accountId}`,
      { headers }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Validate Facebook token
   * @desc    Validate Facebook token
   * @route   POST /api/social-accounts/:id/facebook/validate
   * @access  Private
   */
  validateFacebookToken(accountId: string): Observable<TokenValidationResponse> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.getJWTToken()}`
    });

    return this.http.post<TokenValidationResponse>(
      `${environment.apiUrl}${environment.apiEndpoints.socialAccounts}/${accountId}/facebook/validate`,
      {},
      { headers }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Refresh Facebook token
   * @desc    Refresh Facebook token
   * @route   POST /api/social-accounts/:id/facebook/refresh
   * @access  Private
   */
  refreshFacebookToken(accountId: string): Observable<TokenRefreshResponse> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.getJWTToken()}`
    });

    return this.http.post<TokenRefreshResponse>(
      `${environment.apiUrl}${environment.apiEndpoints.socialAccounts}/${accountId}/facebook/refresh`,
      {},
      { headers }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Create a post on a Facebook Page
   * POST /api/social-accounts/:socialAccountId/facebook/pages/:pageId/post
   */
  createFacebookPagePost(
    socialAccountId: string,
    pageId: string,
    payload: CreateFacebookPostRequest
  ): Observable<CreatePostResponse> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.getJWTToken()}`
    });

    return this.http.post<CreatePostResponse>(
      `${environment.apiUrl}${environment.apiEndpoints.socialAccounts}/${socialAccountId}/facebook/pages/${pageId}/post`,
      payload,
      { headers }
    ).pipe(catchError(this.handleError));
  }

  /**
   * Create an Instagram image post
   * POST /api/social-accounts/:socialAccountId/instagram/:instagramAccountId/post
   */
  createInstagramPost(
    socialAccountId: string,
    instagramAccountId: string,
    payload: CreateInstagramPostRequest
  ): Observable<CreatePostResponse> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.getJWTToken()}`
    });

    return this.http.post<CreatePostResponse>(
      `${environment.apiUrl}${environment.apiEndpoints.socialAccounts}/${socialAccountId}/instagram/${instagramAccountId}/post`,
      payload,
      { headers }
    ).pipe(catchError(this.handleError));
  }

  // List Facebook Page posts
  listFacebookPagePosts(socialAccountId: string, pageId: string, limit = 25, after?: string, before?: string) {
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${this.getJWTToken()}` });
    const q: string[] = [`limit=${limit}`];
    if (after) q.push(`after=${encodeURIComponent(after)}`);
    if (before) q.push(`before=${encodeURIComponent(before)}`);
    const url = `${environment.apiUrl}${environment.apiEndpoints.socialAccounts}/${socialAccountId}/facebook/pages/${pageId}/posts?${q.join('&')}`;
    return this.http.get<ListFacebookPostsResponse>(url, { headers }).pipe(catchError(this.handleError));
  }

  // Update a Facebook post
  updateFacebookPost(socialAccountId: string, postId: string, payload: { message?: string; is_hidden?: boolean }) {
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${this.getJWTToken()}` });
    const url = `${environment.apiUrl}${environment.apiEndpoints.socialAccounts}/${socialAccountId}/facebook/posts/${postId}`;
    return this.http.post(url, payload, { headers }).pipe(catchError(this.handleError));
  }

  // Delete a Facebook post
  deleteFacebookPost(socialAccountId: string, postId: string) {
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${this.getJWTToken()}` });
    const url = `${environment.apiUrl}${environment.apiEndpoints.socialAccounts}/${socialAccountId}/facebook/posts/${postId}`;
    return this.http.delete(url, { headers }).pipe(catchError(this.handleError));
  }

  // List Instagram media
  listInstagramMedia(socialAccountId: string, instagramAccountId: string, limit = 25, after?: string, before?: string) {
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${this.getJWTToken()}` });
    const q: string[] = [`limit=${limit}`];
    if (after) q.push(`after=${encodeURIComponent(after)}`);
    if (before) q.push(`before=${encodeURIComponent(before)}`);
    const url = `${environment.apiUrl}${environment.apiEndpoints.socialAccounts}/${socialAccountId}/instagram/${instagramAccountId}/media?${q.join('&')}`;
    return this.http.get<ListInstagramMediaResponse>(url, { headers }).pipe(catchError(this.handleError));
  }

  // Update Instagram media
  updateInstagramMedia(socialAccountId: string, mediaId: string, payload: { comment_enabled: boolean }) {
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${this.getJWTToken()}` });
    const url = `${environment.apiUrl}${environment.apiEndpoints.socialAccounts}/${socialAccountId}/instagram/media/${mediaId}`;
    return this.http.post(url, payload, { headers }).pipe(catchError(this.handleError));
  }

  // Delete Instagram media
  deleteInstagramMedia(socialAccountId: string, mediaId: string, instagramAccountId?: string) {
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${this.getJWTToken()}` });
    const query = instagramAccountId ? `?instagramAccountId=${encodeURIComponent(instagramAccountId)}` : '';
    const url = `${environment.apiUrl}${environment.apiEndpoints.socialAccounts}/${socialAccountId}/instagram/media/${mediaId}${query}`;
    return this.http.delete(url, { headers }).pipe(catchError(this.handleError));
  }

  /**
   * Check if user has valid Facebook session
   */
  async hasValidFacebookSession(): Promise<boolean> {
    try {
      const status = await this.getLoginStatus();
      return status.status === 'connected' && !!status.authResponse;
    } catch (error) {
      console.error('Error checking Facebook session:', error);
      return false;
    }
  }

  /**
   * Get Facebook user profile information
   */
  async getFacebookUserProfile(): Promise<any> {
    await this.ensureSDKReady();

    return new Promise((resolve, reject) => {
      FB.api('/me', { fields: 'name,email,picture' }, (response: any) => {
        if (response && !response.error) {
          resolve(response);
        } else {
          reject(new Error('Failed to get user profile'));
        }
      });
    });
  }

  /**
   * Get Facebook pages managed by user
   */
  async getFacebookPages(): Promise<any> {
    await this.ensureSDKReady();

    return new Promise((resolve, reject) => {
      FB.api('/me/accounts', { fields: 'name,category,access_token' }, (response: any) => {
        if (response && !response.error) {
          resolve(response);
        } else {
          reject(new Error('Failed to get Facebook pages'));
        }
      });
    });
  }

  /**
   * Get JWT token from localStorage
   */
  private getJWTToken(): string {
    return localStorage.getItem('jwt_token') || localStorage.getItem('token') || '';
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: any): Observable<never> {
    console.error('Facebook Service Error:', error);

    let errorMessage = 'An unknown error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      errorMessage = error.error?.message || error.message || `Error Code: ${error.status}`;
    }

    return throwError(() => new Error(errorMessage));
  }
}
