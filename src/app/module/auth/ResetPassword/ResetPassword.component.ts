import { Component, OnInit, inject, signal } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule, AbstractControl, ValidatorFn, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ToasterService } from '../../../shared/services/toaster.service';
import { AuthService } from 'src/app/core/services/user-auth.service';

@Component({
  selector: 'app-ResetPassword',
  templateUrl: './ResetPassword.component.html',
  styleUrls: ['./ResetPassword.component.css'],
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink]
})
export class ResetPasswordComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService); // Updated service injection
  private readonly toasterService = inject(ToasterService);
  private readonly fb = inject(FormBuilder);

  resetPasswordForm!: FormGroup;
  resetToken!: string;
  readonly isLoading = signal(false);
  readonly isSubmitting = signal(false);

  ngOnInit() {
    this.initializeForm();
    this.extractResetToken();
  }

  private initializeForm(): void {
    this.resetPasswordForm = this.fb.group({
      password: ['', [
        Validators.required,
        Validators.minLength(6),
        this.passwordStrengthValidator()
      ]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: [this.passwordMatchValidator()]
    });
  }

  private extractResetToken(): void {
    this.route.params.subscribe(params => {
      this.resetToken = params['resettoken'];
      if (!this.resetToken) {
        this.toasterService.show('Invalid reset token. Redirecting to forgot password page.', 'error');
        this.router.navigate(['/auth/forgot-password']);
      }
    });
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

  /**
   * Custom validator for password strength
   */
  private passwordStrengthValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value;
      if (!value) {
        return null;
      }

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

  onSubmit(): void {
    if (this.resetPasswordForm.invalid) {
      this.markFormGroupTouched();
      this.toasterService.show('Please fill in all required fields correctly', 'error');
      return;
    }

    if (this.isSubmitting() || this.isLoading()) {
      return; // Prevent double submission
    }

    this.isSubmitting.set(true);
    this.isLoading.set(true);

    const { password } = this.resetPasswordForm.value;

    // this.authService.resetPassword(this.resetToken, password).subscribe({
    //   next: (response) => {
    //     console.log('✅ Reset password response:', response);

    //     if (response.success) {
    //       this.toasterService.show(response.message || 'Password has been reset successfully!', 'success');

    //       // Clear the form
    //       this.resetPasswordForm.reset();

    //       // Navigate to login page after short delay
    //       setTimeout(() => {
    //         this.router.navigate(['/auth/login'], {
    //           queryParams: { message: 'Password reset successful. Please login with your new password.' }
    //         });
    //       }, 1500);
    //     } else {
    //       this.toasterService.show(response.message || 'Failed to reset password. Please try again.', 'error');
    //     }
    //   },
    //   error: (err: HttpErrorResponse) => {
    //     console.error('❌ Reset password failed:', err);

    //     let errorMessage = 'Failed to reset password';

    //     if (err.error?.message) {
    //       errorMessage = err.error.message;
    //     } else if (err.status === 400) {
    //       errorMessage = 'Invalid or expired reset token';
    //     } else if (err.status === 404) {
    //       errorMessage = 'Reset token not found';
    //     } else if (err.status >= 500) {
    //       errorMessage = 'Server error. Please try again later.';
    //     }

    //     this.toasterService.show(errorMessage, 'error');
    //   },
    //   complete: () => {
    //     this.isSubmitting.set(false);
    //     this.isLoading.set(false);
    //   }
    // });
  }

  /**
   * Mark all form fields as touched to show validation errors
   */
  private markFormGroupTouched(): void {
    Object.keys(this.resetPasswordForm.controls).forEach(key => {
      const control = this.resetPasswordForm.get(key);
      control?.markAsTouched();
    });
  }

  /**
   * Get field error message for template
   */
  getFieldError(fieldName: string): string | null {
    const field = this.resetPasswordForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${this.getFieldDisplayName(fieldName)} is required`;
      }
      if (field.errors['minlength']) {
        return `${this.getFieldDisplayName(fieldName)} must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
      if (field.errors['mismatch']) {
        return 'Passwords do not match';
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
    const field = this.resetPasswordForm.get(fieldName);
    return !!(field?.errors && field.touched);
  }

  /**
   * Get display name for form fields
   */
  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      'password': 'Password',
      'confirmPassword': 'Confirm Password'
    };
    return displayNames[fieldName] || fieldName;
  }

  /**
   * Get password strength indicator
   */
  getPasswordStrength(): { score: number; text: string; color: string } {
    const passwordControl = this.resetPasswordForm.get('password');
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
   * Navigate back to forgot password
   */
  goToForgotPassword(): void {
    this.router.navigate(['/auth/forgot-password']);
  }

  /**
   * Navigate to login
   */
  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}
