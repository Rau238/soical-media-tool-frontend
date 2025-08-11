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
import { ToasterService } from '../../shared/services/toaster.service';
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
  readonly selectedAccountData = computed(() => {
    const selectedId = this.selectedAccountId();
    if (!selectedId) return null;
    return this.enhancedAccountData().get(selectedId);
  });

  ngOnInit(): void {
    this.loadConnectedAccounts();
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
