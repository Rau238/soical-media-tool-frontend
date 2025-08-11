import { Component, signal, computed, inject, HostListener } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DialogService } from '../../services/dialog.service';
import { AuthService } from 'src/app/core/services/user-auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, FormsModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  private dialogService: DialogService = inject(DialogService);
  private readonly authService = inject(AuthService); // Updated service injection
  private readonly router = inject(Router);

  // Reactive state
  readonly searchQuery = signal('');
  lastResult: boolean | null = null;
  readonly isProfileMenuOpen = signal(false);
  readonly isNotificationMenuOpen = signal(false);
  readonly notificationCount = signal(3);

  // Computed state
  readonly currentUser = signal<any>(null);
  readonly isAuthenticated = computed(() => this.authService.isAuthenticated());
  readonly userInitials = computed(() => {
    const user = this.currentUser();
    if (!user?.user?.name) return 'JD';
    return user.user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase();
  });

  readonly userAvatarUrl = computed(() => {
    const user = this.currentUser();
    const name = user?.user?.name || 'John Doe';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=indigo&color=fff`;
  });

  constructor() {
    // Subscribe to currentUser$ and update the signal
    this.authService.currentUser$.subscribe(user => {
      this.currentUser.set(user);
    });
  }

  // Menu handlers
  toggleProfileMenu(): void {
    this.isProfileMenuOpen.update(open => !open);
    this.isNotificationMenuOpen.set(false);
  }

  toggleNotificationMenu(): void {
    this.isNotificationMenuOpen.update(open => !open);
    this.isProfileMenuOpen.set(false);
  }

  closeAllMenus(): void {
    this.isProfileMenuOpen.set(false);
    this.isNotificationMenuOpen.set(false);
  }

  // Navigation handlers
  onCreatePost(): void {
    this.closeAllMenus();
    this.router.navigate(['/dashboard/create-post']);
  }

  onSearch(): void {
    const query = this.searchQuery().trim();
    if (query) {
      this.router.navigate(['/search'], { queryParams: { q: query } });
    }
  }

  onProfileClick(): void {
    this.closeAllMenus();
    this.router.navigate(['/profile']);
  }

  onSettingsClick(): void {
    this.closeAllMenus();
    this.router.navigate(['/settings']);
  }

  showConfirmDialog() {
    this.dialogService.open({
      title: 'Confirm Action',
      content: 'Are you sure you want to log out? Any unsaved changes will be lost.',
      confirmText: 'Yes, Logout',
      cancelText: 'Stay Logged In',
      size: 'md'
    }).subscribe(result => {
      this.lastResult = result;
      if (result) {
        this.onLogout();
        console.log('User confirmed the action, logging out...');
      }
    });
  }

  onLogout(): void {
    this.closeAllMenus();
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/auth/login']);
    });
  }

  // Close menus when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    const isMenuClick = target.closest('.profile-menu, .notification-menu, .menu-button');

    if (!isMenuClick) {
      this.closeAllMenus();
    }
  }
}
