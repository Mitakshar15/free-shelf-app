import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-oauth-callback',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="oauth-callback-container">
      <div class="loading-spinner">
        <svg class="spinner-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
      <p>{{ message }}</p>
    </div>
  `,
  styles: [`
    .oauth-callback-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      text-align: center;
      padding: 2rem;
    }
    .loading-spinner {
      margin-bottom: 1rem;
    }
    .spinner-icon {
      width: 2.5rem;
      height: 2.5rem;
      animation: spin 1s linear infinite;
      color: var(--primary-color);
    }
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `]
})
export class OAuthCallbackComponent implements OnInit {
  message = 'Processing authentication...';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Extract parameters from URL
    this.route.queryParams.subscribe(params => {
      // Check for state parameter to prevent CSRF attacks
      const state = params['state'];
      const isValidState = state ? this.authService.verifyOAuthState(state) : false;
      
      // The response will be in the JSON format displayed in the browser
      // We need to parse it from the page content
      try {
        // Try to parse the JSON response from the page content
        const pageContent = document.body.innerText;
        if (pageContent && pageContent.includes('token')) {
          const response = JSON.parse(pageContent);
          
          if (response.data?.token) {
            // Verify state before accepting the token
            if (isValidState) {
              // Handle the OAuth callback with the token
              this.authService.handleOAuthCallback(response.data.token);
              this.message = 'Authentication successful! Redirecting...';
              
              // Redirect to home page after a short delay
              setTimeout(() => {
                this.router.navigate(['/']);
              }, 1500);
              return;
            } else {
              this.message = 'Invalid authentication state. Possible CSRF attack. Redirecting to login...';
            }
          } else {
            this.message = 'No token found in the response. Redirecting to login...';
          }
        } else {
          this.message = 'Invalid response format. Redirecting to login...';
        }
      } catch (error) {
        console.error('Error parsing OAuth response:', error);
        this.message = 'Error processing authentication response. Redirecting to login...';
      }
      
      // If we reach here, something went wrong
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 1500);
    });
  }
}
