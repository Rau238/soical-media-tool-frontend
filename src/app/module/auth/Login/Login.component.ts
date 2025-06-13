import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UserAuthService } from '../../../core/services/user-auth.service';
import { ToasterService } from '../../../shared/services/toaster.service';
import { GoogleSigninButtonModule, SocialAuthService, SocialUser } from '@abacritt/angularx-social-login';

@Component({
  selector: 'app-Login',
  templateUrl: './Login.component.html',
  styleUrls: ['./Login.component.css'],
  imports: [FormsModule, RouterLink, ReactiveFormsModule, GoogleSigninButtonModule],
})
export class LoginComponent  {
  loginForm!: FormGroup;
  isLoading = false;
  constructor(
    private socialAuthService: SocialAuthService,
    private fb: FormBuilder,
    private authService: UserAuthService,
    private router: Router,
    private toasterService: ToasterService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }


  loginWithGoogle(){
    this.socialAuthService.authState.subscribe({
      next: (user: SocialUser) => {
        if (user && user.idToken) {
          this.authService.googleLogin(user.idToken).subscribe({
            next: (response) => {
              if (response.success) {
                this.router.navigate(['/dashboard'])
                this.toasterService.show('Google login successful!', 'success');
              }
            },
            error: (error) => {
              console.error('LoginComponent: Google login failed:', error);
              this.toasterService.show('Google login failed. Please try again.', 'error');
            },
          });
        } else {
          console.error('LoginComponent: No idToken in SocialUser:', user);
          this.toasterService.show('Google login failed. No credentials received.', 'error');
        }
      },
      error: (error) => {
        console.error('LoginComponent: authState error:', error);
        this.toasterService.show('Google login error. Please try again.', 'error');
      },
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.toasterService.show('All fields are required', 'error');
      return;
    }
    this.isLoading = true;
    const { email, password } = this.loginForm.value;
    this.authService.login(email, password).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.toasterService.show('Login successful!', 'success');
          this.router.navigate(['/dashboard'])
        } else {
          this.isLoading = false;
          this.toasterService.show('Invalid response from server', 'error');
        }
      },
      error: (error) => {
        this.isLoading = false;
        const errorMessage = error?.error?.message || error?.message || 'Invalid email or password';
        this.toasterService.show(errorMessage, 'error');
      },
    });
  }
}
