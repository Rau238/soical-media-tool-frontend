import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { UserAuthService } from '../../../core/services/user-auth.service';
import { ToasterService } from '../../../shared/services/toaster.service';

@Component({
  selector: 'app-ForgotPassword',
  templateUrl: './ForgotPassword.component.html',
  styleUrls: ['./ForgotPassword.component.css'],
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule]
})
export class ForgotPasswordComponent implements OnInit {
  forgotPasswordForm!: FormGroup;
  isLoading = false;

  constructor(
    private router: Router,
    private userAuthService: UserAuthService,
    private toasterService: ToasterService
  ) { }

  ngOnInit() {
    this.forgotPasswordForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email])
    });
  }

  onSubmit() {
    if (this.forgotPasswordForm.invalid) {
      this.toasterService.show('Please enter a valid email address.', 'error');
      return;
    }

    this.isLoading = true;
    const { email } = this.forgotPasswordForm.value;

    this.userAuthService.forgotPassword(email).subscribe({
      next: (response) => {
        if (response.success) {
          this.toasterService.show(response.message || 'Password reset link sent to your email.', 'success');
          this.forgotPasswordForm.reset();
          this.router.navigate(['/login']);
        } else {
          this.toasterService.show('Failed to send reset link. Please try again.', 'error');
        }
          this.isLoading = false;
      },
      error: (error) => {
        const errorMessage = error?.error?.message || error?.message || 'Failed to send reset link. Please try again.';
        this.toasterService.show(errorMessage, 'error');
        this.isLoading = false;
      },

    });
  }
}
