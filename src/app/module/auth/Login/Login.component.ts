import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { ToasterService } from '../../../shared/services/toaster.service';
import { AuthService, LoginData } from 'src/app/core/services/user-auth.service';

@Component({
  selector: 'app-Login',
  templateUrl: './Login.component.html',
  styleUrls: ['./Login.component.css'],
  imports: [FormsModule, RouterLink, ReactiveFormsModule],
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService); // Updated service injection
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly toasterService = inject(ToasterService);

  readonly isLoading = signal(false); // Manual loading state since AuthService doesn't expose it
  readonly isSubmitting = signal(false);

  readonly loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched();
      this.toasterService.show('Please fill in all required fields correctly', 'error');
      return;
    }

    if (this.isSubmitting() || this.isLoading()) {
      return; // Prevent double submission
    }

    this.isSubmitting.set(true);
    this.isLoading.set(true);

    const credentials: LoginData = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password
    };

    this.authService.login(credentials).subscribe({
      next: (response) => {
        console.log('✅ Login response:', response);

        if (response.success) {
          this.toasterService.show(response.message || 'Login successful!', 'success');

          // Get return URL from query params, but avoid auth page loops
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
          const finalReturnUrl = this.sanitizeReturnUrl(returnUrl);

          console.log('🔄 Login successful, navigating to:', finalReturnUrl);

          // Use setTimeout to ensure token is set and authentication state is updated
          setTimeout(() => {
            this.router.navigate([finalReturnUrl]).then(success => {
              console.log('🔄 Navigation result:', success);
              if (!success) {
                console.warn('⚠️ Navigation failed, redirecting to dashboard');
                this.router.navigate(['/dashboard']);
              }
            }).catch(error => {
              console.error('❌ Navigation error:', error);
              this.router.navigate(['/dashboard']);
            });
          }, 100);
        } else {
          this.toasterService.show(response.message || 'Login failed', 'error');
        }
      },
      error: (error) => {
        console.error('❌ Login failed:', error);
        this.toasterService.show(error?.message || 'Invalid email or password', 'error');
      },
      complete: () => {
        this.isSubmitting.set(false);
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Sanitize return URL to prevent infinite loops
   */
  private sanitizeReturnUrl(returnUrl: string): string {
    // Prevent auth page loops and malformed URLs
    if (returnUrl.startsWith('/auth') || returnUrl.startsWith('/login') || returnUrl.startsWith('/register')) {
      return '/dashboard';
    }

    // Prevent excessively long URLs (potential loop indicators)
    if (returnUrl.length > 200) {
      return '/dashboard';
    }

    // Decode URL in case it's encoded multiple times
    try {
      let decodedUrl = returnUrl;
      let previousUrl = '';

      // Decode up to 5 times to handle multiple encoding
      for (let i = 0; i < 5 && decodedUrl !== previousUrl; i++) {
        previousUrl = decodedUrl;
        decodedUrl = decodeURIComponent(decodedUrl);
      }

      // If still contains encoded characters, default to dashboard
      if (decodedUrl.includes('%') || decodedUrl !== returnUrl) {
        return '/dashboard';
      }

      return decodedUrl;
    } catch (error) {
      console.warn('⚠️ Failed to decode return URL:', returnUrl, error);
      return '/dashboard';
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  // Utility methods for template
  getFieldError(fieldName: string): string | null {
    const field = this.loginForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        const displayName = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
        return `${displayName} is required`;
      }
      if (field.errors['email']) return 'Please enter a valid email address';
      if (field.errors['minlength']) {
        const displayName = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
        return `${displayName} must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
    }
    return null;
  }

  // Check if a field has errors and is touched
  hasFieldError(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field?.errors && field.touched);
  }

  // Check if user is already authenticated (for template usage)
  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }
}
