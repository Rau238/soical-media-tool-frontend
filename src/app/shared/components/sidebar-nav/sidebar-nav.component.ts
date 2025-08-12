import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { DialogService } from '../../services/dialog.service';
import { AuthService } from 'src/app/core/services/user-auth.service';
import { CommonModule } from '@angular/common';
import { DEFAULT_SIDEBAR_ITEMS, SidebarNavItem } from '../../constants/nav.constants';

@Component({
  selector: 'app-sidebar-nav',
  templateUrl: './sidebar-nav.component.html',
  styleUrls: ['./sidebar-nav.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class SidebarNavComponent implements OnInit {
  private router: Router = inject(Router)
  private userAuthService: AuthService = inject(AuthService)
  private dialogService: DialogService = inject(DialogService)

  constructor() { }
  lastResult: boolean | null = null;
    mode: 'collapsed' | 'expanded' = 'expanded';
  items: SidebarNavItem[] = DEFAULT_SIDEBAR_ITEMS;

  ngOnInit() {
    try {
      const saved = localStorage.getItem('sidebar_mode');
      if (saved === 'collapsed' || saved === 'expanded') {
        this.mode = saved as 'collapsed' | 'expanded';
      }
    } catch (_) { /* ignore */ }
  }

  toggleMode() {
    this.mode = this.mode === 'expanded' ? 'collapsed' : 'expanded';
    try { localStorage.setItem('sidebar_mode', this.mode); } catch (_) { /* ignore */ }
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
        this.logout(); // Call logout if confirmed
        console.log('User confirmed the action, logging out...');
      }
    });
  }

  logout() {
    this.userAuthService.logout().subscribe({
      next: () => {
        console.log('User logged out successfully');
        this.router.navigate(['/login']);
      }
    });
  }
}
