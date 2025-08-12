export interface SidebarNavItem {
  label: string;
  path: string;
  icon: string; // Font Awesome class string, e.g., 'fa-solid fa-gauge'
  exact?: boolean;
  external?: boolean;
}

export const DEFAULT_SIDEBAR_ITEMS: SidebarNavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: 'fa-solid fa-gauge', exact: true },
  { label: 'Connect Accounts', path: '/connect-account', icon: 'fa-solid fa-link' },
  { label: 'Create Post', path: '/create-post', icon: 'fa-regular fa-square-plus' },
  { label: 'Posts', path: '/posts', icon: 'fa-solid fa-eye' },
  { label: 'Analytics', path: '/analytics', icon: 'fa-solid fa-chart-simple' },
  { label: 'Schedule', path: '/schedule', icon: 'fa-regular fa-calendar' },
  { label: 'Settings', path: '/settings', icon: 'fa-solid fa-gear' }
];
