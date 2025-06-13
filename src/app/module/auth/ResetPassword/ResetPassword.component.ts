import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule, AbstractControl, ValidatorFn } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { UserAuthService } from '../../../core/services/user-auth.service';
import { ToasterService } from '../../../shared/services/toaster.service';

@Component({
  selector: 'app-ResetPassword',
  templateUrl: './ResetPassword.component.html',
  styleUrls: ['./ResetPassword.component.css'],
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink]
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm!: FormGroup;
  resetToken!: string;
  isLoading = false

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userAuthService: UserAuthService,
    private toasterService: ToasterService
  ) { }

  ngOnInit() {
    this.resetPasswordForm = new FormGroup({
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
      confirmPassword: new FormControl('', [Validators.required])
    }, { validators: ResetPasswordComponent.passwordMatchValidator() });

    this.route.params.subscribe(params => {
      this.resetToken = params['resettoken'];
      if (!this.resetToken) {
        this.router.navigate(['/forgot-password']);
      }
    });
  }

  static passwordMatchValidator(): ValidatorFn {
    return (form: AbstractControl): { [key: string]: any } | null => {
      const password = form.get('password');
      const confirmPassword = form.get('confirmPassword');

      if (!password || !confirmPassword) {
        return null;
      }

      return password.value === confirmPassword.value ? null : { mismatch: true };
    };
  }

  onSubmit() {
    if (this.resetPasswordForm.valid) {
      this.isLoading = true;
      const { password } = this.resetPasswordForm.value;
      this.userAuthService.resetPassword(this.resetToken, password).subscribe({
        next: (response) => {
          if (response.success) {
            this.isLoading = false;
            this.toasterService.show(response.message || 'Password has been reset successfully!', 'success');
            this.router.navigate(['/login']);
          } else {
            this.isLoading = false;
            this.toasterService.show('Failed to update the password. Please try again.', 'error');
          }
        },
        error: (err: HttpErrorResponse) => {
          this.isLoading = false;
          this.toasterService.show(err.message || 'Failed to reset password', 'error', 3000);
        }
      });
    } else {
      this.isLoading = false;
      this.toasterService.show('Please check your form for errors.', 'error', 3000);
    }
  }
}
