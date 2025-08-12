import { inject, Injectable } from '@angular/core';
// No direct HttpClient usage here; all traffic goes through ApiService
import { Observable } from 'rxjs';
import { environment } from 'src/environment/environment';
import { ApiService } from './api.service';

export interface LinkedInTokenResponse { access_token: string; refresh_token?: string; expires_in: number; }
export interface LinkedInConnectRequest { accessToken: string; refreshToken?: string; expiresIn?: number; }
export interface LinkedInCreatePostRequest { accessToken: string; authorUrn: string; text: string; }
export interface LinkedInListRequest { accessToken: string; authorUrn?: string; orgUrn?: string; start?: number; count?: number; }
export interface LinkedInDeleteRequest { accessToken: string; urn: string; }

@Injectable({ providedIn: 'root' })

export class LinkedInService {
  private apiService = inject(ApiService);

  exchangeCodeForToken(code: string, redirectUri?: string): Observable<{ success: boolean; data: LinkedInTokenResponse }> {
    return this.apiService.post<{ success: boolean; data: LinkedInTokenResponse }>(
      `${environment.apiEndpoints.socialAccounts}/linkedin/oauth/exchange`,
      { code, redirectUri },
      false
    );
  }

  connectAccount(accessToken: string, refreshToken?: string, expiresIn?: number) {
    const payload: LinkedInConnectRequest = { accessToken, refreshToken, expiresIn };
    return this.apiService.post<{ success: boolean; data: any }>(
      `${environment.apiEndpoints.socialAccounts}/connect/linkedin`,
      payload
    );
  }

  createMemberPost(accessToken: string, authorUrn: string, text: string) {
    const payload: LinkedInCreatePostRequest = { accessToken, authorUrn, text };
    return this.apiService.post<{ success: boolean; data: any }>(
      `${environment.apiEndpoints.socialAccounts}/linkedin/member/post`,
      payload
    );
  }

  createOrganizationPost(accessToken: string, orgUrn: string, text: string) {
    const payload = { accessToken, orgUrn, text };
    return this.apiService.post<{ success: boolean; data: any }>(
      `${environment.apiEndpoints.socialAccounts}/linkedin/organization/post`,
      payload
    );
  }

  listMemberPosts(accessToken: string, authorUrn: string, start = 0, count = 25) {
    const qs = `?accessToken=${encodeURIComponent(accessToken)}&authorUrn=${encodeURIComponent(authorUrn)}&start=${start}&count=${count}`;
    return this.apiService.get<{ success: boolean; data: any }>(
      `${environment.apiEndpoints.socialAccounts}/linkedin/member/posts${qs}`
    );
  }

  listOrganizationPosts(accessToken: string, orgUrn: string, start = 0, count = 25) {
    const qs = `?accessToken=${encodeURIComponent(accessToken)}&orgUrn=${encodeURIComponent(orgUrn)}&start=${start}&count=${count}`;
    return this.apiService.get<{ success: boolean; data: any }>(
      `${environment.apiEndpoints.socialAccounts}/linkedin/organization/posts${qs}`
    );
  }

  deletePost(accessToken: string, urn: string) {
    const payload: LinkedInDeleteRequest = { accessToken, urn };
    return this.apiService.delete<{ success: boolean; data: any }>(
      `${environment.apiEndpoints.socialAccounts}/linkedin/posts`,
      payload
    );
  }

  getProfile(accessToken: string) {
    return this.apiService.get<{ success: boolean; data: { id: string; fullName?: string; headline?: string; photoUrl?: string } }>(
      `${environment.apiEndpoints.socialAccounts}/linkedin/me?accessToken=${encodeURIComponent(accessToken)}`
    );
  }

  getAdminOrganizations(accessToken: string) {
    return this.apiService.get<{ success: boolean; data: any }>(
      `${environment.apiEndpoints.socialAccounts}/linkedin/organizations?accessToken=${encodeURIComponent(accessToken)}`
    );
  }

  refreshAccessToken(refreshToken: string) {
    return this.apiService.post<{ success: boolean; data: LinkedInTokenResponse }>(
      `${environment.apiEndpoints.socialAccounts}/linkedin/oauth/refresh`,
      { refreshToken },
      false
    );
  }

  logoutLocal() {
    return this.apiService.post<{ success: boolean; message: string }>(
      `${environment.apiEndpoints.socialAccounts}/linkedin/logout-local`,
      {},
      false
    );
  }
}
