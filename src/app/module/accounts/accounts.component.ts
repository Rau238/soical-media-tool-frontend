import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FacebookService, SocialAccountResponse, TokenValidationResponse, TokenRefreshResponse } from '../../core/services/facebook.service';
import { SocialAccountsService } from '../../core/services/social-accounts.service';
import {
  ConnectedAccountsResponse,
  SocialAccount,
  FacebookPageDetails,
  InstagramAccount,
  DetailedFacebookProfileResponse,
  FacebookPagesResponse,
  InstagramAccountsResponse,
  PageInsightsResponse
} from '../../core/models/api-models';
import { LinkedInNormalizedProfile } from '../../core/models/api-models';
import { ToasterService } from '../../shared/services/toaster.service';
import { LinkedInService } from '../../core/services/linkedIn.service';
import { environment } from 'src/environment/environment';
import { CommonModule } from '@angular/common';

interface ConnectionResult {
  type: 'success' | 'error' | 'info';
  message: string;
  data?: any;
}

interface AccountEnhancedData {
  profile?: any;
  pages?: FacebookPageDetails[];
  instagram?: InstagramAccount[];
  insights?: any;
  liProfile?: LinkedInNormalizedProfile | null;
  liOrganizations?: any[];
  liOrgForbidden?: boolean;
}

@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.css'],
  imports: [CommonModule, RouterLink]
})
export class AccountsComponent implements OnInit {
  private readonly facebookService = inject(FacebookService);
  private readonly socialAccountsService = inject(SocialAccountsService);
  private readonly toasterService = inject(ToasterService);
  private readonly linkedInService = inject(LinkedInService);
  private readonly router = inject(Router);

  // Component state
  readonly isLoading = signal(false);
  readonly isConnecting = signal(false);
  readonly isValidating = signal<string | null>(null);
  readonly isRefreshing = signal<string | null>(null);
  readonly isDisconnecting = signal<string | null>(null);
  readonly isLoadingPages = signal<string | null>(null);
  readonly isLoadingInsights = signal<string | null>(null);
  readonly error = signal<string | null>(null);
  readonly result = signal<ConnectionResult | null>(null);
  readonly connectedAccounts = signal<SocialAccount[]>([]);
  // LinkedIn lightweight state (token stored locally for now)
  readonly liAccessToken = signal<string | null>(null);
  readonly isLIConnecting = signal(false);
  readonly liProfile = signal<{ id: string; fullName?: string; headline?: string; photoUrl?: string } | null>(null);
  readonly liOrganizations = signal<any[]>([]);
  readonly liPosts = signal<any[]>([]);
  readonly liStart = signal(0);
  readonly liCount = signal(10);

  // Enhanced data
  readonly enhancedAccountData = signal<Map<string, AccountEnhancedData>>(new Map());
  readonly selectedAccountId = signal<string | null>(null);
  readonly showDetailedView = signal(false);

  // Computed properties
  readonly hasConnectedAccounts = computed(() => this.connectedAccounts().length > 0);
  readonly validAccounts = computed(() =>
    this.connectedAccounts().filter(acc => this.isTokenValid(acc))
  );
  readonly expiredAccounts = computed(() =>
    this.connectedAccounts().filter(acc => this.isTokenExpired(acc))
  );
  readonly facebookAccounts = computed(() =>
    this.connectedAccounts().filter(acc => acc.platform === 'facebook')
  );
  readonly instagramAccounts = computed(() => {
    // Get Instagram accounts from Facebook's enhanced data
    const allInstagram: InstagramAccount[] = [];
    this.facebookAccounts().forEach(fbAccount => {
      const enhancedData = this.enhancedAccountData().get(fbAccount.id);
      if (enhancedData?.instagram) {
        allInstagram.push(...enhancedData.instagram);
      }
    });
    return allInstagram;
  });
  readonly facebookPages = computed(() => {
    // Get Facebook pages from Facebook's enhanced data
    const allPages: FacebookPageDetails[] = [];
    this.facebookAccounts().forEach(fbAccount => {
      const enhancedData = this.enhancedAccountData().get(fbAccount.id);
      if (enhancedData?.pages) {
        allPages.push(...enhancedData.pages);
      }
    });
    return allPages;
  });
  readonly linkedInAccounts = computed(() =>
    this.connectedAccounts().filter(acc => acc.platform === 'linkedin')
  );
  readonly selectedAccountData = computed(() => {
    const selectedId = this.selectedAccountId();
    if (!selectedId) return null;
    return this.enhancedAccountData().get(selectedId);
  });

  ngOnInit(): void {
    this.loadConnectedAccounts();
    // Load existing LinkedIn token and handle OAuth callback
    const existing = localStorage.getItem('li_access_token');
    if (existing) this.liAccessToken.set(existing);
    this.handleLinkedInCallbackIfPresent();
  }

  // Helper methods for token validation
  isTokenValid(account: SocialAccount): boolean {
    return account.tokenValidationStatus === 'valid' && new Date(account.tokenExpiry) > new Date();
  }

  isTokenExpired(account: SocialAccount): boolean {
    return account.tokenValidationStatus === 'expired' || new Date(account.tokenExpiry) <= new Date();
  }

  isTokenExpiringSoon(tokenExpiry: string): boolean {
    if (!tokenExpiry) return false;
    const expiryDate = new Date(tokenExpiry);
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  }

  getDaysUntilExpiry(tokenExpiry: string): number {
    if (!tokenExpiry) return 0;
    const expiryDate = new Date(tokenExpiry);
    return Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  }

  async loadConnectedAccounts(): Promise<void> {
    try {
      this.isLoading.set(true);
      this.error.set(null);

      this.socialAccountsService.getConnectedAccounts().subscribe({
        next: (response: ConnectedAccountsResponse) => {
          console.log('📨 Raw API response:', response);

          if (response.success && response.data && response.data.accounts) {
            const accounts = response.data.accounts.map(account => ({
              ...account,
              id: account.id || account._id,
              _id: account._id || account.id,
              user: account.user || '',
              __v: account.__v || 0
            }));

            console.log('✅ Loaded connected accounts:', accounts);
            this.connectedAccounts.set(accounts);

            // Auto-load Instagram accounts for Facebook accounts
            this.loadInstagramForFacebookAccounts(accounts);
            // Auto-load LinkedIn profile and organizations for LinkedIn accounts
            this.loadLinkedInForAccounts(accounts);
          } else {
            console.log('📝 No connected accounts found');
            this.connectedAccounts.set([]);
          }
        },
        error: (error: any) => {
          console.error('❌ Failed to load connected accounts:', error);
          this.error.set('Failed to load connected accounts: ' + (error.message || 'Server Error'));
          this.connectedAccounts.set([]);
        },
        complete: () => {
          this.isLoading.set(false);
        }
      });
    } catch (error) {
      console.error('❌ Error in loadConnectedAccounts:', error);
      this.error.set('An unexpected error occurred');
      this.isLoading.set(false);
    }
  }

  /**
   * Auto-load Instagram accounts for all Facebook accounts
   */
  private loadInstagramForFacebookAccounts(accounts: SocialAccount[]): void {
    const facebookAccounts = accounts.filter(acc => acc.platform === 'facebook');
    facebookAccounts.forEach(fbAccount => {
      this.loadInstagramAccounts(fbAccount.id);
      this.loadFacebookPages(fbAccount.id);
    });
  }

  /**
   * Auto-load LinkedIn profile and organizations for all LinkedIn accounts
   */
  private loadLinkedInForAccounts(accounts: SocialAccount[]): void {
    const liAccounts = accounts.filter(acc => acc.platform === 'linkedin');
    const validLiAccounts = liAccounts.filter(acc => this.isTokenValid(acc));
    validLiAccounts.forEach(liAccount => {
      this.loadLinkedInProfileByAccount(liAccount.id);
      this.loadLinkedInOrganizationsByAccount(liAccount.id);
    });
  }

  private loadLinkedInProfileByAccount(accountId: string): void {
    this.socialAccountsService.getLinkedInProfileByAccount(accountId).subscribe({
      next: (res) => {
        if (res?.success && res.data) {
          const currentData = this.enhancedAccountData();
          const accountData = (currentData.get(accountId) || {}) as AccountEnhancedData;
          accountData.liProfile = res.data;
          currentData.set(accountId, accountData);
          this.enhancedAccountData.set(new Map(currentData));
        }
      },
      error: (e) => {
        if (e?.status === 401) {
          const accounts = this.connectedAccounts();
          const idx = accounts.findIndex(a => a.id === accountId);
          if (idx !== -1) {
            accounts[idx] = { ...accounts[idx], tokenValidationStatus: 'expired' } as any;
            this.connectedAccounts.set([...accounts]);
          }
        }
      }
    });
  }

  private loadLinkedInOrganizationsByAccount(accountId: string): void {
    this.socialAccountsService.getLinkedInOrganizationsByAccount(accountId).subscribe({
      next: (res) => {
        const elements = (res as any)?.data?.elements || [];
        const currentData = this.enhancedAccountData();
        const accountData = (currentData.get(accountId) || {}) as AccountEnhancedData;
        accountData.liOrganizations = elements;
        accountData.liOrgForbidden = false;
        currentData.set(accountId, accountData);
        this.enhancedAccountData.set(new Map(currentData));
      },
      error: (e) => {
        const currentData = this.enhancedAccountData();
        const accountData = (currentData.get(accountId) || {}) as AccountEnhancedData;
        if (e?.status === 403) {
          accountData.liOrgForbidden = true;
          accountData.liOrganizations = [];
          currentData.set(accountId, accountData);
          this.enhancedAccountData.set(new Map(currentData));
        } else if (e?.status === 401) {
          const accounts = this.connectedAccounts();
          const idx = accounts.findIndex(a => a.id === accountId);
          if (idx !== -1) {
            accounts[idx] = { ...accounts[idx], tokenValidationStatus: 'expired' } as any;
            this.connectedAccounts.set([...accounts]);
          }
        }
      }
    });
  }

  async connectFacebookAccount(): Promise<void> {
    if (this.isConnecting()) return;

    try {
      this.isConnecting.set(true);
      this.result.set(null);

      console.log('🔄 Initiating Facebook connection...');

      const hasValidSession = await this.facebookService.hasValidFacebookSession();

      let loginResponse;
      if (!hasValidSession) {
        loginResponse = await this.facebookService.loginToFacebook();
        if (!loginResponse.authResponse || loginResponse.status !== 'connected') {
          throw new Error('Facebook login failed');
        }
      } else {
        loginResponse = await this.facebookService.getLoginStatus();
      }

      console.log('✅ Facebook login successful, connecting to backend...');

      this.socialAccountsService.connectFacebookAccount(
        loginResponse.authResponse.accessToken,
        loginResponse.authResponse.userID
      ).subscribe({
        next: (response: any) => {
          console.log('✅ Facebook account connected:', response);

          if (response.success) {
            this.result.set({
              type: 'success',
              message: response.message || 'Facebook account connected successfully!',
              data: response.data
            });
            this.loadConnectedAccounts();
          } else {
            throw new Error(response.message || 'Connection failed');
          }
        },
        error: (error: any) => {
          console.error('❌ Failed to connect Facebook account:', error);
          this.result.set({
            type: 'error',
            message: 'Failed to connect Facebook account: ' + (error.message || 'Unknown error')
          });
        },
        complete: () => {
          this.isConnecting.set(false);
        }
      });

    } catch (error: any) {
      console.error('❌ Error connecting Facebook account:', error);
      this.result.set({
        type: 'error',
        message: error.message || 'Failed to connect Facebook account'
      });
      this.isConnecting.set(false);
    }
  }

  validateToken(account: SocialAccount): void {
    if (this.isValidating()) return;

    this.isValidating.set(account.id);
    this.result.set(null);

    console.log('🔄 Validating token for account:', account.accountName);

    this.socialAccountsService.validateSocialAccountToken(account.id).subscribe({
      next: (response: any) => {
        console.log('✅ Token validation response:', response);

        if (response.success) {
          this.result.set({
            type: 'success',
            message: `Token for ${account.accountName} is valid`
          });

          const accounts = this.connectedAccounts();
          const index = accounts.findIndex(acc => acc.id === account.id);
          if (index !== -1) {
            accounts[index] = {
              ...accounts[index],
              tokenValidationStatus: 'valid',
              lastTokenValidation: new Date().toISOString()
            };
            this.connectedAccounts.set([...accounts]);
          }
        } else {
          this.result.set({
            type: 'error',
            message: `Token validation failed for ${account.accountName}: ${response.message || 'Token is invalid'}`
          });
        }
      },
      error: (error: any) => {
        console.error('❌ Token validation failed:', error);
        this.result.set({
          type: 'error',
          message: `Token validation failed for ${account.accountName}: ${error.message || 'Unknown error'}`
        });
      },
      complete: () => {
        this.isValidating.set(null);
      }
    });
  }

  refreshToken(account: SocialAccount): void {
    if (this.isRefreshing()) return;

    this.isRefreshing.set(account.id);
    this.result.set(null);

    console.log('🔄 Refreshing token for account:', account.accountName);

    this.socialAccountsService.refreshFacebookToken(account.id).subscribe({
      next: (response: any) => {
        console.log('✅ Token refresh response:', response);

        if (response.success) {
          this.result.set({
            type: 'success',
            message: `Token for ${account.accountName} refreshed successfully`
          });

          const accounts = this.connectedAccounts();
          const index = accounts.findIndex(acc => acc.id === account.id);
          if (index !== -1) {
            accounts[index] = {
              ...accounts[index],
              tokenValidationStatus: 'valid',
              lastTokenValidation: new Date().toISOString()
            };
            this.connectedAccounts.set([...accounts]);
          }
        } else {
          this.result.set({
            type: 'error',
            message: response.message || 'Failed to refresh token'
          });
        }
      },
      error: (error: any) => {
        console.error('❌ Token refresh failed:', error);
        this.result.set({
          type: 'error',
          message: `Token refresh failed for ${account.accountName}: ${error.message || 'Unknown error'}`
        });
      },
      complete: () => {
        this.isRefreshing.set(null);
      }
    });
  }

  disconnectAccount(account: SocialAccount): void {
    if (this.isDisconnecting()) return;

    if (!confirm(`Are you sure you want to disconnect "${account.accountName}"? This action cannot be undone.`)) {
      return;
    }

    this.isDisconnecting.set(account.id);
    this.result.set(null);

    console.log('🔄 Disconnecting account:', account.accountName);

    this.socialAccountsService.disconnectSocialAccount(account.id).subscribe({
      next: (response: any) => {
        console.log('✅ Account disconnected:', response);

        this.result.set({
          type: 'success',
          message: `${account.accountName} disconnected successfully`
        });

        const currentAccounts = this.connectedAccounts();
        const updatedAccounts = currentAccounts.filter(acc => acc.id !== account.id);
        this.connectedAccounts.set(updatedAccounts);
      },
      error: (error: any) => {
        console.error('❌ Failed to disconnect account:', error);
        this.result.set({
          type: 'error',
          message: `Failed to disconnect ${account.accountName}: ${error.message || 'Unknown error'}`
        });
      },
      complete: () => {
        this.isDisconnecting.set(null);
      }
    });
  }

  loadInstagramAccounts(accountId: string): void {
    if (this.isLoadingPages() === accountId) return;

    this.isLoadingPages.set(accountId);

    console.log('🔄 Loading Instagram accounts for account:', accountId);

    this.socialAccountsService.getInstagramAccounts(accountId).subscribe({
      next: (response) => {
        console.log('✅ Instagram accounts loaded:', response);

        if (response.success && response.data?.instagramAccounts) {
          const currentData = this.enhancedAccountData();
          const accountData = currentData.get(accountId) || {};
          accountData.instagram = response.data.instagramAccounts;
          currentData.set(accountId, accountData);
          this.enhancedAccountData.set(new Map(currentData));

          console.log(`✅ Loaded ${response.data.instagramAccounts.length} Instagram accounts for account ${accountId}`);
        }
      },
      error: (error) => {
        console.error('❌ Failed to load Instagram accounts:', error);
      },
      complete: () => {
        this.isLoadingPages.set(null);
      }
    });
  }

  loadFacebookPages(accountId: string): void {
    console.log('🔄 Loading Facebook pages for account:', accountId);

    this.socialAccountsService.getFacebookPages(accountId).subscribe({
      next: (response) => {
        console.log('✅ Facebook pages loaded:', response);

        if (response.success && response.data?.pages) {
          const currentData = this.enhancedAccountData();
          const accountData = currentData.get(accountId) || {};
          accountData.pages = response.data.pages;
          currentData.set(accountId, accountData);
          this.enhancedAccountData.set(new Map(currentData));

          console.log(`✅ Loaded ${response.data.pages.length} Facebook pages for account ${accountId}`);
        }
      },
      error: (error) => {
        console.error('❌ Failed to load Facebook pages:', error);
      }
    });
  }

  refreshAccounts(): void {
    this.loadConnectedAccounts();
  }

  // ===== LinkedIn Integration (OAuth helper) =====
  openLinkedInAuth(): void {
    if (this.isLIConnecting()) return;
    const clientId = environment.oauth.linkedIn.appId;
    const scopes = environment.oauth.linkedIn.scope || 'r_liteprofile r_emailaddress w_member_social';
    const state = Math.random().toString(36).slice(2);
    localStorage.setItem('li_oauth_state', state);
    const redirect = encodeURIComponent(environment.oauth.linkedIn.redirectUri);
    const scopeParam = encodeURIComponent(scopes.replace(/,/g, ' '));
    const url = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${redirect}&state=${state}&scope=${scopeParam}`;
    window.location.href = url;
  }

  private handleLinkedInCallbackIfPresent(): void {
    const params = new URLSearchParams(window.location.search);
    if (params.get('code')) {
      const code = params.get('code')!;
      const returnedState = params.get('state');
      const savedState = localStorage.getItem('li_oauth_state');
      if (savedState && returnedState && savedState !== returnedState) {
        this.toasterService.show('LinkedIn auth state mismatch', 'error');
        return;
      }
      this.isLIConnecting.set(true);
      this.linkedInService.exchangeCodeForToken(code, environment.oauth.linkedIn.redirectUri).subscribe({
        next: (res: any) => {
          console.log('✅ LinkedIn token exchange response:', res);
          const accessToken = res?.data?.access_token;
          const refreshToken = res?.data?.refresh_token;
          const expiresIn = res?.data?.expires_in;
          if (accessToken) {
            localStorage.setItem('li_access_token', accessToken);
            this.liAccessToken.set(accessToken);
            // Store in backend DB
        this.linkedInService.connectAccount(accessToken, refreshToken, expiresIn).subscribe({
          next: (res: any) => {
            this.toasterService.show('LinkedIn connected', 'success');
            const profile = res?.data?.profile;
            if (profile) this.liProfile.set(profile);
          },
              error: (e) => this.toasterService.show(e?.message || 'Failed to save LinkedIn account', 'error')
            });
          } else {
            this.toasterService.show('Failed to get LinkedIn token', 'error');
          }
          this.cleanLinkedInCallbackParams();
        },
        error: (e) => {
          this.toasterService.show(e?.message || 'LinkedIn connection failed', 'error');
          this.cleanLinkedInCallbackParams();
        },
        complete: () => this.isLIConnecting.set(false)
      });
    }
  }

  private cleanLinkedInCallbackParams(): void {
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('code');
      url.searchParams.delete('state');
      url.searchParams.delete('li_oauth');
      window.history.replaceState({}, document.title, url.toString());
    } catch (_) { /* noop */ }
  }

  disconnectLinkedIn(): void {
    localStorage.removeItem('li_access_token');
    this.liAccessToken.set(null);
    this.toasterService.show('Disconnected LinkedIn', 'info');
    // Also notify backend (no-op placeholder for now)
    this.linkedInService.logoutLocal().subscribe({ next: () => {}, error: () => {} });
  }

  // Load LinkedIn profile/orgs/posts helpers
  loadLinkedInProfile(): void {
    const token = this.liAccessToken();
    if (!token) return;
    this.linkedInService.getProfile(token).subscribe({
      next: (res) => this.liProfile.set(res?.data || null),
      error: (e) => this.toasterService.show(e?.message || 'Failed to load profile', 'error')
    });
  }

  loadLinkedInOrganizations(): void {
    const token = this.liAccessToken();
    if (!token) return;
    this.linkedInService.getAdminOrganizations(token).subscribe({
      next: (res: any) => this.liOrganizations.set(res?.elements || []),
      error: (e) => this.toasterService.show(e?.message || 'Failed to load organizations', 'error')
    });
  }

  loadLinkedInMemberPosts(): void {
    const token = this.liAccessToken();
    const prof = this.liProfile();
    if (!token || !prof) return;
    const personUrn = `urn:li:person:${prof.id}`;
    this.linkedInService.listMemberPosts(token, personUrn, this.liStart(), this.liCount()).subscribe({
      next: (res: any) => this.liPosts.set(res?.elements || []),
      error: (e) => this.toasterService.show(e?.message || 'Failed to load posts', 'error')
    });
  }

  createLinkedInMemberPost(text: string): void {
    const token = this.liAccessToken();
    const prof = this.liProfile();
    if (!token || !prof) return;
    const personUrn = `urn:li:person:${prof.id}`;
    this.linkedInService.createMemberPost(token, personUrn, text).subscribe({
      next: () => { this.toasterService.show('Post created', 'success'); this.loadLinkedInMemberPosts(); },
      error: (e) => this.toasterService.show(e?.message || 'Failed to create post', 'error')
    });
  }

  clearResult(): void {
    this.result.set(null);
  }

  getStatusBadgeClass(account: SocialAccount): string {
    if (this.isTokenValid(account)) {
      return 'bg-green-100 text-green-800';
    } else if (this.isTokenExpired(account)) {
      return 'bg-red-100 text-red-800';
    } else {
      return 'bg-yellow-100 text-yellow-800';
    }
  }

  getStatusText(account: SocialAccount): string {
    if (this.isTokenValid(account)) {
      return 'Valid';
    } else if (this.isTokenExpired(account)) {
      return 'Expired';
    } else {
      return 'Invalid';
    }
  }

  formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }
}
