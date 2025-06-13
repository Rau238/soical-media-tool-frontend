import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormGroup, Validators, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { UserAuthService } from '../../../core/services/user-auth.service';
import { ToasterService } from '../../../shared/services/toaster.service';
import { GoogleSigninButtonModule, SocialAuthService, SocialUser } from '@abacritt/angularx-social-login';

@Component({
  selector: 'app-Signup',
  templateUrl: './Signup.component.html',
  styleUrls: ['./Signup.component.css'],
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, GoogleSigninButtonModule]
})
export class SignupComponent {
  signupForm: FormGroup;

  constructor(
    private socialAuthService: SocialAuthService,
    private fb: FormBuilder,
    private authService: UserAuthService,
    private router: Router,
    private toasterService: ToasterService
  ) {
    this.signupForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }
  signInwithGoogle() {
    this.socialAuthService.authState.subscribe({
      next: (user: SocialUser) => {
        if (user && user.idToken) {
          this.authService.googleLogin(user.idToken).subscribe({
            next: (response) => {
              if (response.success) {
                this.router.navigate(['/dashboard'])
                this.toasterService.show('Google signin successful!', 'success');
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

  onSubmit(): void {
    if (this.signupForm.invalid) {
      this.toasterService.show('All fields are required', 'error', 5000);
      return;
    }

    const { name, email, password } = this.signupForm.value;
    this.authService.signup(name, email, password).subscribe({
      next: () => {
        this.toasterService.show('Signup successful! Please login.', 'success', 5000);
        this.router.navigate(['/login']);
      },
      error: (error) => {
        this.toasterService.show(error.message || 'User already exists', 'error', 5000);
      },
    });
  }

}
