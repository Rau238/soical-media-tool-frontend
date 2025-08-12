import { Injectable, inject } from '@angular/core';
import { Observable, catchError, of, map } from 'rxjs';
import { ApiService } from './api.service';
import { LinkedInNormalizedProfile } from '../models/api-models';
import {
  ConnectedAccountsResponse,
  FacebookConnectionRequest,
  FacebookConnectionResponse,
  TokenValidationResponse,
  DisconnectResponse,
  SocialAccount,
  DetailedFacebookProfileResponse,
  FacebookPagesResponse,
  FacebookPageDetailsResponse,
  PageInsightsResponse,
  InstagramAccountsResponse,
  InstagramProfileResponse
} from '../models/api-models';

@Injectable({
  providedIn: 'root'
})
export class SocialAccountsService {
  private apiService = inject(ApiService);

  /**
   * Get all connected social accounts for the current user
   * GET /social-accounts
   */
getConnectedAccounts(): Observable<ConnectedAccountsResponse> {
  return this.apiService.get<ConnectedAccountsResponse>('/api/social-accounts');
}

  /**
   * Connect Facebook account to the user's profile
   * POST /social-accounts/connect/facebook
   */
  connectFacebookAccount(accessToken: string, userID: string): Observable<FacebookConnectionResponse> {
    const requestBody: FacebookConnectionRequest = { accessToken, userID };

    return this.apiService.post<FacebookConnectionResponse>('/api/social-accounts/connect/facebook', requestBody).pipe(
      catchError((error) => {
        console.error('❌ Failed to connect Facebook account:', error);
        return of({
          success: false,
          message: 'Failed to connect Facebook account: ' + (error.error?.message || 'Unknown error'),
          data: null
        } as any);
      })
    );
  }

  /**
   * Get single social account details
   * GET /social-accounts/:id
   */
  getSocialAccount(accountId: string): Observable<{ success: boolean; message: string; data: SocialAccount }> {
    return this.apiService.get<{ success: boolean; message: string; data: SocialAccount }>(`/api/social-accounts/${accountId}`).pipe(
      catchError((error) => {
        console.error('❌ Failed to get social account:', error);
        return of({
          success: false,
          message: 'Failed to retrieve social account',
          data: null
        } as any);
      })
    );
  }

  /**
   * Validate Facebook token for an account
   * POST /social-accounts/:id/facebook/validate
   */
  validateFacebookToken(accountId: string): Observable<TokenValidationResponse> {
    return this.apiService.post<TokenValidationResponse>(`/api/social-accounts/${accountId}/facebook/validate`, {}).pipe(
      catchError((error) => {
        console.error('❌ Failed to validate Facebook token:', error);
        return of({
          success: false,
          message: 'Token validation failed',
          data: {
            isValid: false,
            error: error.error?.message || 'Validation failed'
          }
        } as TokenValidationResponse);
      })
    );
  }

  /**
   * Refresh Facebook token for an account
   * POST /social-accounts/:id/facebook/refresh
   */
  refreshFacebookToken(accountId: string): Observable<any> {
    return this.apiService.post<any>(`/api/social-accounts/${accountId}/facebook/refresh`, {}).pipe(
      catchError((error) => {
        console.error('❌ Failed to refresh Facebook token:', error);
        return of({
          success: false,
          message: 'Token refresh failed',
          data: null
        });
      })
    );
  }

  /**
   * Disconnect social account from the user's profile
   * DELETE /social-accounts/:id
   */
  disconnectSocialAccount(accountId: string): Observable<DisconnectResponse> {
    return this.apiService.delete<DisconnectResponse>(`/api/social-accounts/${accountId}`).pipe(
      catchError((error) => {
        console.error('❌ Failed to disconnect social account:', error);
        return of({
          success: false,
          message: 'Failed to disconnect account: ' + (error.error?.message || 'Unknown error')
        } as DisconnectResponse);
      })
    );
  }

  // Legacy method for backward compatibility
  disconnectFacebookAccount(accountId: string): Observable<{ success: boolean; message: string }> {
    return this.disconnectSocialAccount(accountId);
  }

  // Legacy method for backward compatibility
  validateSocialAccountToken(accountId: string): Observable<any> {
    return this.validateFacebookToken(accountId);
  }

  // ===== FACEBOOK PROFILE & DATA APIs =====

  /**
   * Get detailed Facebook profile information
   * GET /api/social-accounts/:socialAccountId/facebook/profile/detailed
   */
  getDetailedFacebookProfile(socialAccountId: string): Observable<DetailedFacebookProfileResponse> {
    return this.apiService.get<DetailedFacebookProfileResponse>(`/api/social-accounts/${socialAccountId}/facebook/profile/detailed`).pipe(
      catchError((error) => {
        console.error('❌ Failed to get detailed Facebook profile:', error);
        return of({
          success: false,
          message: 'Failed to retrieve detailed Facebook profile',
          data: null
        } as any);
      })
    );
  }

  /**
   * Get all Facebook pages managed by the user
   * GET /api/social-accounts/:socialAccountId/facebook/pages
   */
  getFacebookPages(socialAccountId: string): Observable<FacebookPagesResponse> {
    return this.apiService.get<FacebookPagesResponse>(`/api/social-accounts/${socialAccountId}/facebook/pages`).pipe(
      catchError((error) => {
        console.error('❌ Failed to get Facebook pages:', error);
        return of({
          success: false,
          message: 'Failed to retrieve Facebook pages',
          data: null
        } as any);
      })
    );
  }

  /**
   * Get detailed information about a specific Facebook page
   * GET /api/social-accounts/:socialAccountId/facebook/pages/:pageId
   */
  getFacebookPageDetails(socialAccountId: string, pageId: string): Observable<FacebookPageDetailsResponse> {
    return this.apiService.get<FacebookPageDetailsResponse>(`/api/social-accounts/${socialAccountId}/facebook/pages/${pageId}`).pipe(
      catchError((error) => {
        console.error('❌ Failed to get Facebook page details:', error);
        return of({
          success: false,
          message: 'Failed to retrieve Facebook page details',
          data: null
        } as any);
      })
    );
  }

  /**
   * Get analytics and insights data for a Facebook page
   * GET /api/social-accounts/:socialAccountId/facebook/pages/:pageId/insights
   */
  getFacebookPageInsights(socialAccountId: string, pageId: string, metrics?: string[]): Observable<PageInsightsResponse> {
    let url = `/api/social-accounts/${socialAccountId}/facebook/pages/${pageId}/insights`;
    if (metrics && metrics.length > 0) {
      url += `?metrics=${metrics.join(',')}`;
    }

    return this.apiService.get<PageInsightsResponse>(url).pipe(
      catchError((error) => {
        console.error('❌ Failed to get Facebook page insights:', error);
        return of({
          success: false,
          message: 'Failed to retrieve Facebook page insights',
          data: null
        } as any);
      })
    );
  }

  // ===== INSTAGRAM APIs (via Facebook) =====

  /**
   * Get all Instagram business accounts connected to the user's Facebook pages
   * GET /api/social-accounts/:socialAccountId/instagram/accounts
   */
  getInstagramAccounts(socialAccountId: string): Observable<InstagramAccountsResponse> {
    return this.apiService.get<InstagramAccountsResponse>(`/api/social-accounts/${socialAccountId}/instagram/accounts`).pipe(
      catchError((error) => {
        console.error('❌ Failed to get Instagram accounts:', error);
        return of({
          success: false,
          message: 'Failed to retrieve Instagram accounts',
          data: null
        } as any);
      })
    );
  }

  // ===== LINKEDIN APIs (account-scoped like Facebook) =====

  getLinkedInProfileByAccount(socialAccountId: string) {
    return this.apiService.get<{ success: boolean; data: LinkedInNormalizedProfile }>(`/api/social-accounts/${socialAccountId}/linkedin/me`).pipe(
      catchError((error) => {
        console.error('❌ Failed to get LinkedIn profile:', error);
        return of({ success: false, message: 'Failed to retrieve LinkedIn profile' } as any);
      })
    );
  }

  getLinkedInOrganizationsByAccount(socialAccountId: string) {
    return this.apiService.get<{ success: boolean; data: any }>(`/api/social-accounts/${socialAccountId}/linkedin/organizations`).pipe(
      catchError((error) => {
        console.error('❌ Failed to get LinkedIn organizations:', error);
        return of({ success: false, message: 'Failed to retrieve LinkedIn organizations' } as any);
      })
    );
  }

  createLinkedInMemberPostByAccount(socialAccountId: string, text: string) {
    return this.apiService.post<{ success: boolean; data: any }>(`/api/social-accounts/${socialAccountId}/linkedin/member/post`, { text }).pipe(
      catchError((error) => {
        console.error('❌ Failed to create LinkedIn member post:', error);
        return of({ success: false, message: 'Failed to create LinkedIn post' } as any);
      })
    );
  }

  /**
   * Get detailed information about a specific Instagram business account
   * GET /api/social-accounts/:socialAccountId/instagram/:instagramAccountId/profile
   */
  getInstagramProfile(socialAccountId: string, instagramAccountId: string): Observable<InstagramProfileResponse> {
    return this.apiService.get<InstagramProfileResponse>(`/api/social-accounts/${socialAccountId}/instagram/${instagramAccountId}/profile`).pipe(
      catchError((error) => {
        console.error('❌ Failed to get Instagram profile:', error);
        return of({
          success: false,
          message: 'Failed to retrieve Instagram profile',
          data: null
        } as any);
      })
    );
  }

  // ===== CONVENIENCE METHODS =====

  /**
   * Get comprehensive account data including profile, pages, and Instagram accounts
   */
  getComprehensiveAccountData(socialAccountId: string): Observable<{
    profile?: DetailedFacebookProfileResponse;
    pages?: FacebookPagesResponse;
    instagram?: InstagramAccountsResponse;
  }> {
    return new Observable(observer => {
      const result: any = {};
      let completed = 0;
      const total = 3;

      const complete = () => {
        completed++;
        if (completed === total) {
          observer.next(result);
          observer.complete();
        }
      };

      // Get detailed profile
      this.getDetailedFacebookProfile(socialAccountId).subscribe({
        next: (profile) => {
          if (profile.success) result.profile = profile;
          complete();
        },
        error: () => complete()
      });

      // Get Facebook pages
      this.getFacebookPages(socialAccountId).subscribe({
        next: (pages) => {
          if (pages.success) result.pages = pages;
          complete();
        },
        error: () => complete()
      });

      // Get Instagram accounts
      this.getInstagramAccounts(socialAccountId).subscribe({
        next: (instagram) => {
          if (instagram.success) result.instagram = instagram;
          complete();
        },
        error: () => complete()
      });
    });
  }

  /**
   * Get page insights with predefined common metrics
   */
  getCommonPageInsights(socialAccountId: string, pageId: string): Observable<PageInsightsResponse> {
    const commonMetrics = [
      'page_fans',
      'page_fan_adds',
      'page_fan_removes',
      'page_views',
      'page_posts_impressions',
      'page_engaged_users'
    ];
    return this.getFacebookPageInsights(socialAccountId, pageId, commonMetrics);
  }
}
