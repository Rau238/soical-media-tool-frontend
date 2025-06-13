import { Route, Routes } from '@angular/router';
import { ForgotPasswordComponent } from './module/auth/ForgotPassword/ForgotPassword.component';
import { LoginComponent } from './module/auth/Login/Login.component';
import { ResetPasswordComponent } from './module/auth/ResetPassword/ResetPassword.component';
import { SignupComponent } from './module/auth/Signup/Signup.component';
import { AuthGuard } from './shared/guards/auth.guard';
import { DashboardComponent } from './module/dashboard/dashboard.component';
import { SettingComponent } from './module/setting/setting.component';
import { AppLayoutComponent } from './module/layout/app-layout.component';
import { AccountsComponent } from './module/accounts/accounts.component';

export const appRoutes: Route[] = [
  // Public Routes (No Layout)
  {
    path: '',
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'signup', component: SignupComponent },
      { path: 'forgot-password', component: ForgotPasswordComponent },
      { path: 'reset-password/:resettoken', component: ResetPasswordComponent },
    ]
  },

  // Protected Routes (With AppLayout)
  {
    path: '',
    component: AppLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'connect-account', component: AccountsComponent },
      { path: 'settings', component: SettingComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  // Wildcard route (404 fallback)
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
