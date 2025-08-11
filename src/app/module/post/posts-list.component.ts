import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogComponent } from 'src/app/shared/components/dialog/dialog.component';
import { PaginationComponent } from 'src/app/shared/components/pagination/pagination.component';
import { CardComponent } from 'src/app/shared/components/card/card.component';
import { FacebookService } from 'src/app/core/services/facebook.service';
import { DialogService } from 'src/app/shared/services/dialog.service';
import { SocialAccountsService } from 'src/app/core/services/social-accounts.service';
import { ToasterService } from 'src/app/shared/services/toaster.service';
import { SocialAccount, FacebookPagesResponse, InstagramAccountsResponse } from 'src/app/core/models/api-models';

@Component({
  selector: 'app-posts-list',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogComponent, PaginationComponent, CardComponent],
  templateUrl: './posts-list.component.html',
  styleUrls: ['./posts-list.component.css']
})
export class PostsListComponent implements OnInit {
  private fbService = inject(FacebookService);
  private accountsService = inject(SocialAccountsService);
  private toaster = inject(ToasterService);
  private dialogService = inject(DialogService);

  accounts: SocialAccount[] = [];
  facebookAccounts: SocialAccount[] = [];
  selectedAccountId: string | null = null;

  facebookPages: FacebookPagesResponse['data']['pages'] = [];
  selectedPageId: string | null = null;

  instagramAccounts: InstagramAccountsResponse['data']['instagramAccounts'] = [];
  selectedInstagramId: string | null = null;

  target: 'page' | 'instagram' = 'page';

  isLoading = false;
  isActionInFlight = false;
  posts: any[] = [];
  igMedia: any[] = [];
  // Pagination cursors
  fbAfter: string | null = null;
  fbBefore: string | null = null;
  fbNext: string | null = null;
  fbPrev: string | null = null;
  igAfter: string | null = null;
  igBefore: string | null = null;
  igNext: string | null = null;
  igPrev: string | null = null;

  // UI state
  isRefreshing = false;
  expandedPosts = new Set<string>();
  expandedMedia = new Set<string>();
  imageLoadedPosts = new Set<string>();
  imageLoadedMedia = new Set<string>();

  // Edit state (Facebook)
  editingPostId: string | null = null;
  editingMessage = '';

  // Edit state (Instagram)
  editingMediaId: string | null = null;
  editingCommentsEnabled: boolean | null = null;
  editingNewCaption = '';
  deleteOriginalAfterRepost = false;

  ngOnInit(): void {
    this.loadConnectedAccounts();
  }

  loadConnectedAccounts() {
    this.isLoading = true;
    this.accountsService.getConnectedAccounts().subscribe({
      next: (res) => {
        this.accounts = res?.data?.accounts || [];
        this.facebookAccounts = this.accounts.filter(a => a.platform === 'facebook');
        if (this.facebookAccounts.length) {
          this.onSelectAccount(this.facebookAccounts[0]._id || this.facebookAccounts[0].id);
        }
      },
      error: () => this.toaster.show('Failed to load accounts', 'error'),
      complete: () => (this.isLoading = false)
    });
  }

  onSelectAccount(accountId: string) {
    this.selectedAccountId = accountId;
    this.loadTargets();
  }

  onChangeTarget(target: 'page' | 'instagram') {
    this.target = target;
    this.refreshList();
  }

  loadTargets() {
    if (!this.selectedAccountId) return;
    this.accountsService.getFacebookPages(this.selectedAccountId).subscribe({
      next: (res) => {
        this.facebookPages = res?.data?.pages || [];
        this.selectedPageId = this.facebookPages[0]?.id || null;
        this.refreshList();
      }
    });
    this.accountsService.getInstagramAccounts(this.selectedAccountId).subscribe({
      next: (res) => {
        this.instagramAccounts = res?.data?.instagramAccounts || [];
        this.selectedInstagramId = this.instagramAccounts[0]?.id || null;
      }
    });
  }

  refreshList(isFallbackAttempt: boolean = false) {
    if (!this.selectedAccountId) return;
    this.isRefreshing = true;
    if (this.target === 'page' && this.selectedPageId) {
      this.fbService
        .listFacebookPagePosts(
          this.selectedAccountId,
          this.selectedPageId,
          25,
          this.fbAfter || undefined,
          this.fbBefore || undefined
        )
        .subscribe({
          next: (res) => {
            const posts = res?.data?.posts;
            this.posts = posts?.data || [];
            this.fbNext = posts?.paging?.cursors?.after || (posts?.paging?.next ? posts?.paging?.cursors?.after : null);
            this.fbPrev = posts?.paging?.cursors?.before || (posts?.paging?.previous ? posts?.paging?.cursors?.before : null);
            // If no posts returned for a paged request, fall back to first page once
            if (!isFallbackAttempt && this.posts.length === 0 && (this.fbAfter || this.fbBefore)) {
              this.fbAfter = null;
              this.fbBefore = null;
              this.refreshList(true);
            }
          },
          error: () => this.toaster.show('Failed to fetch page posts', 'error'),
          complete: () => (this.isRefreshing = false)
        });
    }
    if (this.target === 'instagram' && this.selectedInstagramId) {
      this.fbService
        .listInstagramMedia(
          this.selectedAccountId,
          this.selectedInstagramId,
          25,
          this.igAfter || undefined,
          this.igBefore || undefined
        )
        .subscribe({
          next: (res) => {
            const media = res?.data?.media;
            this.igMedia = media?.data || [];
            this.igNext = media?.paging?.cursors?.after || (media?.paging?.next ? media?.paging?.cursors?.after : null);
            this.igPrev = media?.paging?.cursors?.before || (media?.paging?.previous ? media?.paging?.cursors?.before : null);
            if (!isFallbackAttempt && this.igMedia.length === 0 && (this.igAfter || this.igBefore)) {
              this.igAfter = null;
              this.igBefore = null;
              this.refreshList(true);
            }
          },
          error: () => this.toaster.show('Failed to fetch Instagram media', 'error'),
          complete: () => (this.isRefreshing = false)
        });
    }
  }

  // Pagination handlers
  nextPage() {
    if (this.target === 'page') { this.fbBefore = null; this.fbAfter = this.fbNext; }
    else { this.igBefore = null; this.igAfter = this.igNext; }
    this.refreshList();
  }
  prevPage() {
    if (this.target === 'page') { this.fbAfter = null; this.fbBefore = this.fbPrev; }
    else { this.igAfter = null; this.igBefore = this.igPrev; }
    this.refreshList();
  }

  // Expand/collapse helpers
  togglePostExpand(id: string) {
    if (this.expandedPosts.has(id)) this.expandedPosts.delete(id); else this.expandedPosts.add(id);
  }

  toggleMediaExpand(id: string) {
    if (this.expandedMedia.has(id)) this.expandedMedia.delete(id); else this.expandedMedia.add(id);
  }

  // Facebook Edit
  startEditPost(post: any) {
    this.editingPostId = post.id;
    this.editingMessage = post.message || '';
  }

  cancelEditPost() {
    this.editingPostId = null;
    this.editingMessage = '';
  }

  saveEditPost(post: any) {
    if (!this.selectedAccountId || !this.editingPostId) return;
    const trimmed = (this.editingMessage || '').trim();
    if (!trimmed) { this.toaster.show('Message cannot be empty', 'warning'); return; }
    this.isActionInFlight = true;
    this.fbService.updateFacebookPost(this.selectedAccountId, this.editingPostId, { message: trimmed }).subscribe({
      next: () => {
        this.toaster.show('Post updated', 'success');
        this.cancelEditPost();
        this.refreshList();
      },
      error: (e) => this.toaster.show(e?.message || 'Update failed', 'error'),
      complete: () => { this.isActionInFlight = false; }
    });
  }

  deletePost(post: any) {
    this.dialogService.open({
      title: 'Delete Facebook post',
      content: 'Are you sure you want to delete this Facebook post? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel'
    }).subscribe((confirmed) => {
      if (!confirmed) return;
      this.fbService.deleteFacebookPost(this.selectedAccountId!, post.id).subscribe({
        next: () => { this.toaster.show('Post deleted', 'success'); this.refreshList(); },
        error: (e) => this.toaster.show(e?.message || 'Delete failed', 'error')
      });
    });
  }

  // Instagram Edit
  startEditMedia(item: any) {
    this.editingMediaId = item.id;
    // API allows toggling comments only; map from item if present, default to true
    this.editingCommentsEnabled = typeof item?.is_comment_enabled === 'boolean' ? item.is_comment_enabled : true;
    this.editingNewCaption = item.caption || '';
    this.deleteOriginalAfterRepost = false;
  }

  cancelEditMedia() {
    this.editingMediaId = null;
    this.editingCommentsEnabled = null;
    this.editingNewCaption = '';
    this.deleteOriginalAfterRepost = false;
  }

  saveEditMedia(item: any) {
    if (!this.selectedAccountId || !this.editingMediaId) return;
    if (typeof this.editingCommentsEnabled !== 'boolean') { this.toaster.show('Please choose comments on/off', 'warning'); return; }
    this.isActionInFlight = true;
    this.fbService.updateInstagramMedia(this.selectedAccountId, this.editingMediaId, { comment_enabled: this.editingCommentsEnabled }).subscribe({
      next: () => {
        this.toaster.show('Media updated', 'success');
        this.cancelEditMedia();
        this.refreshList();
      },
      error: (e) => this.toaster.show(e?.message || 'Update failed', 'error'),
      complete: () => { this.isActionInFlight = false; }
    });
  }

  repostWithNewCaption(item: any) {
    if (!this.selectedAccountId || !this.selectedInstagramId || !this.editingMediaId) return;
    const trimmed = (this.editingNewCaption || '').trim();
    if (!trimmed) { this.toaster.show('Caption cannot be empty', 'warning'); return; }
    if (!item?.media_url) { this.toaster.show('Cannot repost: media URL not available', 'error'); return; }
    if (item?.media_type && item.media_type !== 'IMAGE') {
      this.toaster.show('Repost with new caption is supported for images only', 'warning');
      return;
    }
    this.isActionInFlight = true;
    this.fbService.createInstagramPost(this.selectedAccountId, this.selectedInstagramId, { imageUrl: item.media_url, caption: trimmed }).subscribe({
      next: () => {
        const afterCreate = () => {
          this.toaster.show('Reposted with new caption', 'success');
          this.cancelEditMedia();
          this.refreshList();
          this.isActionInFlight = false;
        };
        if (this.deleteOriginalAfterRepost) {
          this.fbService.deleteInstagramMedia(this.selectedAccountId!, this.editingMediaId!, this.selectedInstagramId!).subscribe({
            next: afterCreate,
            error: () => afterCreate()
          });
        } else {
          afterCreate();
        }
      },
      error: (e) => { this.toaster.show(e?.message || 'Repost failed', 'error'); this.isActionInFlight = false; }
    });
  }

  disableComments(item: any) {
    this.dialogService.open({
      title: 'Disable comments',
      content: 'Instagram does not support deleting published media via 3rd party apps. You can delete it from the Instagram app. Do you want to hide comments?',
      confirmText: 'Hide comments',
      cancelText: 'Close'
    }).subscribe((confirmed) => {
      if (!confirmed) return;
      // fallback: toggle comments off to limit interactions
      this.editingMediaId = item.id;
      this.editingCommentsEnabled = false;
      this.saveEditMedia(item);
    });
  }
}


