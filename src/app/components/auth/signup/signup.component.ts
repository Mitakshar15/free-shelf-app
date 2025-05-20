import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { SignUpRequest } from '../../../models/models';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink]
})
export class SignupComponent {
  signupForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  passwordVisible = false;
  confirmPasswordVisible = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.signupForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
      role: ['RENTER', Validators.required]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    
    if (password !== confirmPassword) {
      form.get('confirmPassword')?.setErrors({ mismatch: true });
      return { mismatch: true };
    }
    
    return null;
  }

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }

  toggleConfirmPasswordVisibility() {
    this.confirmPasswordVisible = !this.confirmPasswordVisible;
  }

  onSubmit() {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const signupRequest: SignUpRequest = {
      username: this.signupForm.value.username,
      firstName: this.signupForm.value.firstName,
      lastName: this.signupForm.value.lastName,
      email: this.signupForm.value.email,
      password: this.signupForm.value.password,
      role: [this.signupForm.value.role]
    };

    this.authService.signUp(signupRequest).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        console.log('Signup response:', response); // Debug log
        
        // Check for successful status code (200 or 201)
        if (response.status?.statusCode === 200 || response.status?.statusCode === 201) {
          // If the API returns a token on signup, store it and redirect to home
          if (response.data?.token) {
            console.log('Token received, storing and redirecting to home');
            // The AuthService will handle setting the token and updating the auth state
            // in its signUp method, so we don't need to do it here
            this.router.navigate(['/']);
          } else {
            console.log('No token received, redirecting to login');
            // If no token is returned, redirect to login
            this.router.navigate(['/login'], { 
              queryParams: { registered: 'success' } 
            });
          }
        } else {
          console.error('Error in signup response:', response);
          this.errorMessage = response.messages?.[0]?.value || 'Something went wrong. Please try again.';
        }
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('Signup error:', error);
        
        // Handle different types of error responses
        if (error.error?.messages?.length > 0) {
          this.errorMessage = error.error.messages[0].value;
        } else if (error.error?.message) {
          this.errorMessage = error.error.message;
        } else if (error.message) {
          this.errorMessage = error.message;
        } else {
          this.errorMessage = 'An error occurred during registration. Please try again.';
        }
      }
    });
  }
}
