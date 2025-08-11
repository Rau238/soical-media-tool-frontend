import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FacebookService, CreateFacebookPostRequest, CreateInstagramPostRequest } from 'src/app/core/services/facebook.service';
import { SocialAccountsService } from 'src/app/core/services/social-accounts.service';
import { ConnectedAccountsResponse, FacebookPagesResponse, InstagramAccountsResponse, SocialAccount } from 'src/app/core/models/api-models';
import { ToasterService } from 'src/app/shared/services/toaster.service';

@Component({
  selector: 'app-post',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css']
})
export class PostComponent implements OnInit {

  private socialAccountsService = inject(SocialAccountsService);
  private fb = inject(FacebookService);
  private router = inject(Router);
  private toaster = inject(ToasterService);

  // Loading states
  isLoadingAccounts = false;
  isLoadingTargets = false;
  isPublishing = false;

  // Accounts and targets
  accounts: SocialAccount[] = [];
  facebookAccounts: SocialAccount[] = [];
  selectedAccountId: string | null = null;

  facebookPages: FacebookPagesResponse['data']['pages'] = [];
  instagramAccounts: InstagramAccountsResponse['data']['instagramAccounts'] = [];

  // Target selection
  targetMode: 'page' | 'instagram' = 'page';
  selectedPageId: string | null = null;
  selectedInstagramId: string | null = null;

  // Composer inputs
  message = '';
  link = '';
  imageUrl = '';
  caption = '';

  // UI helpers
  get canPublish(): boolean {
    if (!this.selectedAccountId) return false;
    if (this.targetMode === 'page' && !this.selectedPageId) return false;
    if (this.targetMode === 'instagram' && !this.selectedInstagramId) return false;
    if (this.targetMode === 'page') {
      return !!(this.message || this.link || this.imageUrl);
    }
    return !!this.imageUrl;
  }

  constructor() { }

  ngOnInit() {
    this.loadConnectedAccounts();
  }

  private loadConnectedAccounts() {
    this.isLoadingAccounts = true;
    this.socialAccountsService.getConnectedAccounts().subscribe({
      next: (res: ConnectedAccountsResponse) => {
        this.accounts = res?.data?.accounts || [];
        this.facebookAccounts = this.accounts.filter(a => a.platform === 'facebook');
        if (this.facebookAccounts.length > 0) {
          this.onSelectAccount(this.facebookAccounts[0]._id || this.facebookAccounts[0].id);
        }
      },
      error: () => {
        this.toaster.show('Failed to load connected accounts', 'error');
      },
      complete: () => (this.isLoadingAccounts = false)
    });
  }

  onSelectAccount(accountId: string) {
    this.selectedAccountId = accountId;
    this.selectedPageId = null;
    this.selectedInstagramId = null;
    this.facebookPages = [];
    this.instagramAccounts = [];
    this.fetchTargets();
  }

  onChangeTargetMode(mode: 'page' | 'instagram') {
    this.targetMode = mode;
  }

  private fetchTargets() {
    if (!this.selectedAccountId) return;
    this.isLoadingTargets = true;
    this.socialAccountsService.getFacebookPages(this.selectedAccountId).subscribe({
      next: (res) => {
        this.facebookPages = res?.data?.pages || [];
        if (this.facebookPages.length > 0) {
          this.selectedPageId = this.facebookPages[0].id;
        }
      },
      error: () => this.toaster.show('Failed to load Facebook pages', 'error')
    });

    this.socialAccountsService.getInstagramAccounts(this.selectedAccountId).subscribe({
      next: (res) => {
        this.instagramAccounts = res?.data?.instagramAccounts || [];
        if (this.instagramAccounts.length > 0) {
          this.selectedInstagramId = this.instagramAccounts[0].id;
        }
      },
      error: () => this.toaster.show('Failed to load Instagram accounts', 'error'),
      complete: () => (this.isLoadingTargets = false)
    });
  }

  async publish() {
    if (!this.canPublish || !this.selectedAccountId) return;
    this.isPublishing = true;
    try {
      if (this.targetMode === 'page') {
        const payload: CreateFacebookPostRequest = {
          message: this.message || undefined,
          link: this.link || undefined,
          imageUrl: this.imageUrl || undefined
        };
        const res = await this.fb
          .createFacebookPagePost(this.selectedAccountId, this.selectedPageId as string, payload)
          .toPromise();
        this.toaster.show(res?.message || 'Post published to Facebook Page', 'success');
      } else {
        const payload: CreateInstagramPostRequest = {
          imageUrl: this.imageUrl,
          caption: this.caption || this.message || undefined
        };
        const res = await this.fb
          .createInstagramPost(this.selectedAccountId, this.selectedInstagramId as string, payload)
          .toPromise();
        this.toaster.show(res?.message || 'Post published to Instagram', 'success');
      }

      this.message = '';
      this.link = '';
      this.imageUrl = '';
      this.caption = '';
    } catch (error: any) {
      this.toaster.show(error?.message || 'Failed to publish post', 'error');
    } finally {
      this.isPublishing = false;
    }
  }

}
