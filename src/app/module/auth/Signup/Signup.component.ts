import { Component, CUSTOM_ELEMENTS_SCHEMA, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormGroup, Validators, ReactiveFormsModule, FormBuilder, AbstractControl, ValidatorFn } from '@angular/forms';
import { ToasterService } from '../../../shared/services/toaster.service';
import { GoogleSigninButtonModule, SocialAuthService, SocialUser } from '@abacritt/angularx-social-login';
import { CommonModule } from '@angular/common';
import { AuthService, RegisterData } from 'src/app/core/services/user-auth.service';

@Component({
  selector: 'app-Signup',
  templateUrl: './Signup.component.html',
  styleUrls: ['./Signup.component.css'],
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, GoogleSigninButtonModule, CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SignupComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService); // Updated service injection
  private readonly router = inject(Router);
  private readonly toasterService = inject(ToasterService);
  private readonly socialAuthService = inject(SocialAuthService);

  readonly isLoading = signal(false);
  readonly isSubmitting = signal(false);
  readonly showPassword = signal(false);

  signupForm!: FormGroup;

  constructor() {
    this.initializeForm();
    this.setupGoogleSignIn();
  }

  private initializeForm(): void {
    this.signupForm = this.fb.group({
      name: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
        this.nameValidator()
      ]],
      email: ['', [
        Validators.required,
        Validators.email,
        this.emailDomainValidator()
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(6),
        this.passwordStrengthValidator()
      ]],
      confirmPassword: ['', [Validators.required]],
      termsAccepted: [false, [Validators.requiredTrue]]
    }, {
      validators: [this.passwordMatchValidator()]
    });
  }

  private setupGoogleSignIn(): void {
    this.socialAuthService.authState.subscribe((user: SocialUser) => {
      if (user) {
        this.handleGoogleSignup(user);
      }
    });
  }

  /**
   * Custom validator for name field
   */
  private nameValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value;
      if (!value) return null;

      // Check for valid name format (letters, spaces, hyphens, apostrophes)
      const namePattern = /^[a-zA-Z\s\-']+$/;
      if (!namePattern.test(value)) {
        return { invalidName: true };
      }

      return null;
    };
  }

  /**
   * Custom validator for email domain
   */
  private emailDomainValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value;
      if (!value) return null;

      // List of common disposable email domains to block
      const disposableDomains = ['10minutemail.com', 'tempmail.org', 'guerrillamail.com'];
      const domain = value.split('@')[1]?.toLowerCase();

      if (domain && disposableDomains.includes(domain)) {
        return { disposableEmail: true };
      }

      return null;
    };
  }

  /**
   * Custom validator for password strength
   */
  private passwordStrengthValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value;
      if (!value) return null;

      const hasNumber = /[0-9]/.test(value);
      const hasLower = /[a-z]/.test(value);
      const hasUpper = /[A-Z]/.test(value);
      const hasSpecial = /[#?!@$%^&*-]/.test(value);

      const passwordValid = hasNumber && hasLower && hasUpper && value.length >= 8;

      if (!passwordValid) {
        return {
          passwordStrength: {
            hasNumber,
            hasLower,
            hasUpper,
            hasSpecial,
            minLength: value.length >= 8
          }
        };
      }

      return null;
    };
  }

  /**
   * Custom validator for password matching
   */
  private passwordMatchValidator(): ValidatorFn {
    return (form: AbstractControl): { [key: string]: any } | null => {
      const password = form.get('password');
      const confirmPassword = form.get('confirmPassword');

      if (!password || !confirmPassword) {
        return null;
      }

      if (password.value !== confirmPassword.value) {
        confirmPassword.setErrors({ mismatch: true });
        return { mismatch: true };
      } else {
        // Remove mismatch error if passwords match
        const errors = confirmPassword.errors;
        if (errors) {
          delete errors['mismatch'];
          confirmPassword.setErrors(Object.keys(errors).length === 0 ? null : errors);
        }
        return null;
      }
    };
  }

  onSubmit(): void {
    if (this.signupForm.invalid) {
      this.markFormGroupTouched();
      this.toasterService.show('Please fill in all required fields correctly', 'error');
      return;
    }

    if (this.isSubmitting() || this.isLoading()) {
      return; // Prevent double submission
    }

    this.isSubmitting.set(true);
    this.isLoading.set(true);

    const { confirmPassword, termsAccepted, ...userData } = this.signupForm.value;
    const registerData: RegisterData = userData;

    this.authService.register(registerData).subscribe({
      next: (response) => {
        console.log('✅ Signup response:', response);

        if (response.success) {
          this.toasterService.show(response.message || 'Signup successful! Please login.', 'success');

          // Clear the form
          this.signupForm.reset();

          // Navigate to login page
          setTimeout(() => {
            this.router.navigate(['/auth/login'], {
              queryParams: {
                message: 'Registration successful! Please login with your credentials.',
                email: registerData.email
              }
            });
          }, 1500);
        } else {
          this.toasterService.show(response.message || 'Signup failed. Please try again.', 'error');
        }
      },
      error: (error) => {
        console.error('❌ Signup failed:', error);

        let errorMessage = 'Registration failed';

        if (error.message?.includes('email')) {
          errorMessage = 'Email already exists. Please use a different email or try logging in.';
        } else if (error.message?.includes('validation')) {
          errorMessage = 'Please check your input and try again.';
        } else if (error.message) {
          errorMessage = error.message;
        }

        this.toasterService.show(errorMessage, 'error');
      },
      complete: () => {
        this.isSubmitting.set(false);
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Handle Google Sign-up
   */
  private handleGoogleSignup(user: SocialUser): void {
    const googleUserData: RegisterData = {
      name: user.name,
      email: user.email,
      password: '' // Google users don't need password
    };

    this.isLoading.set(true);

    // You might need a separate endpoint for social registration
    this.authService.register(googleUserData).subscribe({
      next: (response) => {
        if (response.success) {
          this.toasterService.show('Google signup successful!', 'success');
          this.router.navigate(['/dashboard']);
        }
      },
      error: (error) => {
        console.error('❌ Google signup failed:', error);
        this.toasterService.show('Google signup failed. Please try manual registration.', 'error');
      },
      complete: () => {
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Toggle password visibility
   */
  togglePasswordVisibility(): void {
    this.showPassword.set(!this.showPassword());
  }

  /**
   * Mark all form fields as touched to show validation errors
   */
  private markFormGroupTouched(): void {
    Object.keys(this.signupForm.controls).forEach(key => {
      const control = this.signupForm.get(key);
      control?.markAsTouched();
    });
  }

  /**
   * Get field error message for template
   */
  getFieldError(fieldName: string): string | null {
    const field = this.signupForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${this.getFieldDisplayName(fieldName)} is required`;
      }
      if (field.errors['email']) {
        return 'Please enter a valid email address';
      }
      if (field.errors['minlength']) {
        const requiredLength = field.errors['minlength'].requiredLength;
        return `${this.getFieldDisplayName(fieldName)} must be at least ${requiredLength} characters`;
      }
      if (field.errors['maxlength']) {
        const maxLength = field.errors['maxlength'].requiredLength;
        return `${this.getFieldDisplayName(fieldName)} cannot exceed ${maxLength} characters`;
      }
      if (field.errors['invalidName']) {
        return 'Name can only contain letters, spaces, hyphens, and apostrophes';
      }
      if (field.errors['disposableEmail']) {
        return 'Please use a permanent email address';
      }
      if (field.errors['mismatch']) {
        return 'Passwords do not match';
      }
      if (field.errors['requiredTrue']) {
        return 'You must accept the terms and conditions';
      }
      if (field.errors['passwordStrength']) {
        const requirements = [];
        const strength = field.errors['passwordStrength'];

        if (!strength.minLength) requirements.push('at least 8 characters');
        if (!strength.hasLower) requirements.push('a lowercase letter');
        if (!strength.hasUpper) requirements.push('an uppercase letter');
        if (!strength.hasNumber) requirements.push('a number');

        return `Password must contain ${requirements.join(', ')}`;
      }
    }
    return null;
  }

  /**
   * Check if field has errors and is touched
   */
  hasFieldError(fieldName: string): boolean {
    const field = this.signupForm.get(fieldName);
    return !!(field?.errors && field.touched);
  }

  /**
   * Get display name for form fields
   */
  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      'name': 'Name',
      'email': 'Email',
      'password': 'Password',
      'confirmPassword': 'Confirm Password'
    };
    return displayNames[fieldName] || fieldName;
  }

  /**
   * Get password strength indicator
   */
  getPasswordStrength(): { score: number; text: string; color: string } {
    const passwordControl = this.signupForm.get('password');
    const password = passwordControl?.value || '';

    if (password.length === 0) {
      return { score: 0, text: '', color: '' };
    }

    let score = 0;
    const checks = {
      length: password.length >= 8,
      lower: /[a-z]/.test(password),
      upper: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[#?!@$%^&*-]/.test(password)
    };

    score = Object.values(checks).filter(Boolean).length;

    const strengthMap = {
      0: { text: 'Very Weak', color: 'text-red-600' },
      1: { text: 'Weak', color: 'text-red-500' },
      2: { text: 'Fair', color: 'text-orange-500' },
      3: { text: 'Good', color: 'text-yellow-500' },
      4: { text: 'Strong', color: 'text-green-500' },
      5: { text: 'Very Strong', color: 'text-green-600' }
    };

    return { score, ...strengthMap[score as keyof typeof strengthMap] };
  }

  /**
   * Navigate to login
   */
  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  /**
   * Check if user is already authenticated
   */
  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }
}
