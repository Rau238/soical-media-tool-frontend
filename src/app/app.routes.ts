import { Route, Routes } from '@angular/router';
import { ForgotPasswordComponent } from './module/auth/ForgotPassword/ForgotPassword.component';
import { LoginComponent } from './module/auth/Login/Login.component';
import { ResetPasswordComponent } from './module/auth/ResetPassword/ResetPassword.component';
import { SignupComponent } from './module/auth/Signup/Signup.component';
import { AuthGuard } from './shared/guards/auth.guard';
import { GuestGuard } from './shared/guards/guest.guard';
import { DashboardComponent } from './module/dashboard/dashboard.component';
import { SettingComponent } from './module/setting/setting.component';
import { AppLayoutComponent } from './module/layout/app-layout.component';
import { AccountsComponent } from './module/accounts/accounts.component';
import { PostComponent } from './module/post/post.component';
import { PostsListComponent } from './module/post/posts-list.component';
import { AnalyticsComponent } from './module/analytics/analytics.component';
import { ScheduleComponent } from './module/schedule/schedule.component';

export const appRoutes: Route[] = [
  {
    path: 'login',
    // canActivate: [GuestGuard],
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'signup', component: SignupComponent },
      { path: 'forgot-password', component: ForgotPasswordComponent },
      { path: 'reset-password/:resettoken', component: ResetPasswordComponent },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  },
  // Protected routes
  {
    path: '',
    component: AppLayoutComponent,
    // canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'connect-account', component: AccountsComponent },
      { path: 'create-post', component: PostComponent },
      { path: 'posts', component: PostsListComponent },
      { path: 'settings', component: SettingComponent },
      { path: 'analytics', component: AnalyticsComponent },
      { path: 'schedule', component: ScheduleComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  // Legacy redirects
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
