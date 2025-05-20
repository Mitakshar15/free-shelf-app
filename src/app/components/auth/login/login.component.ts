import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { SignInRequest } from '../../../models/models';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';
  passwordVisible = false;
  private oauthListener: any;
  
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      rememberMe: [false]
    });
  }

  ngOnInit(): void {
    // Check if user just registered successfully or has OAuth token
    this.route.queryParams.subscribe(params => {
      if (params['registered'] === 'success') {
        this.successMessage = 'Registration successful! Please log in with your credentials.';
      }
      
      // Handle OAuth callback with token
      if (params['token']) {
        this.handleOAuthCallback(params['token']);
      }
    });

    // If already authenticated, redirect to home
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/']);
    }
    
    // Set up listener for OAuth completion event
    this.oauthListener = this.handleOAuthComplete.bind(this);
    window.addEventListener('oauth-complete', this.oauthListener);
  }
  
  ngOnDestroy(): void {
    // Clean up the event listener when component is destroyed
    if (this.oauthListener) {
      window.removeEventListener('oauth-complete', this.oauthListener);
    }
  }

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }
  
  /**
   * Initiates Google OAuth authentication flow
   */
  signInWithGoogle(): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.isSubmitting = true;
    
    // Display instructions to the user
    this.successMessage = 'A popup window will open for Google authentication. After signing in, you will need to copy the JSON response and paste it back here.';
    
    // Initiate the OAuth flow
    this.authService.initiateGoogleAuth();
  }
  
  /**
   * Handles OAuth callback with token
   */
  handleOAuthCallback(token: string): void {
    this.authService.handleOAuthCallback(token);
    this.successMessage = 'Successfully signed in with Google!';
    
    // Redirect to home page or the originally requested URL after a short delay
    setTimeout(() => {
      const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
      this.router.navigateByUrl(returnUrl);
    }, 1000);
  }
  
  /**
   * Handles the OAuth completion event
   */
  private handleOAuthComplete(event: CustomEvent): void {
    this.isSubmitting = false;
    
    if (event.detail?.success) {
      this.successMessage = `Successfully signed in with ${event.detail.provider}!`;
      
      // Redirect to home page or the originally requested URL after a short delay
      setTimeout(() => {
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
        this.router.navigateByUrl(returnUrl);
      }, 1500);
    } else {
      this.errorMessage = event.detail?.error || 'Authentication failed. Please try again.';
    }
  }

  markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else if (control) {
        control.markAsTouched();
      }
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched(this.loginForm);
      return;
    }

    const signInRequest: SignInRequest = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password
    };

    this.isSubmitting = true;
    this.errorMessage = '';

    this.authService.signIn(signInRequest).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        if (response.status?.statusCode === 200 && response.data?.token) {
          // Token is automatically stored in cookies by the AuthService
          // and the authState observable is updated
          
          // Redirect to home page or the originally requested URL
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
          this.router.navigateByUrl(returnUrl);
        } else {
          this.errorMessage = response.messages?.[0]?.value || 'Invalid credentials';
        }
      },
      error: (error) => {
        this.isSubmitting = false;
        this.errorMessage = 'An error occurred. Please try again.';
        console.error('Login error:', error);
      }
    });
  }
}
