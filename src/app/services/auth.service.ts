import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
import { 
  SignUpRequest, 
  SignInRequest, 
  ApiResponse, 
  User
} from '../models/models';
import { CookieService } from './cookie.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public baseUrl = 'http://localhost:8080/v1'
  private apiUrl = 'http://localhost:8080/v1/auth';
  private oauthUrl = 'http://localhost:8080/oauth2/authorize';
  private tokenKey = 'free-shelf-token';
  private authStateSubject = new BehaviorSubject<boolean>(false);
  
  // Observable for components to subscribe to authentication state changes
  public authState$ = this.authStateSubject.asObservable();

  constructor(
    private http: HttpClient,
    private cookieService: CookieService,
    private router: Router  
  ) {
    // Initialize auth state based on token existence
    this.authStateSubject.next(this.isAuthenticated());

    this.getCurrentUser().subscribe(user => {
      if (user) {
        const hasUnassignedRole = user.roles && user.roles.includes('UNASSIGNED');
        
        // Check if user needs to select roles
        if (hasUnassignedRole) {
          // If at home or oauth callback, redirect to role selection
          if (window.location.pathname === '/home' || 
              window.location.pathname === '/oauth/callback') {
            console.log('User has UNASSIGNED role, redirecting to role selection');
            this.router.navigate(['/select-role']);
          }
        } else {
          // If at role selection page and user already has roles, redirect to home
          if (window.location.pathname === '/select-role') {
            console.log('User already has roles, redirecting to home');
            this.router.navigate(['/home']);
          }
        }
      }
    });
  }

  signUp(signUpRequest: SignUpRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/signup`, signUpRequest, { withCredentials: true })
      .pipe(
        tap(response => {
          console.log('AuthService - Processing signup response:', response);
          // If the API returns a token on signup, store it and update auth state
          if (response.data?.token) {
            console.log('AuthService - Token found, setting token and updating auth state');
            this.setToken(response.data.token);
            this.authStateSubject.next(true);
          } else {
            console.log('AuthService - No token found in signup response');
            // Check if we're authenticated anyway (cookie might be HttpOnly)
            this.checkAuthStatus().subscribe();
          }
        })
      );
  }

  signIn(signInRequest: SignInRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/signin`, signInRequest, { withCredentials: true })
      .pipe(
        tap(response => {
          console.log('AuthService - Processing signin response:', response);
          if (response.data?.token) {
            console.log('AuthService - Token found in signin response');
            this.setToken(response.data.token);
            this.authStateSubject.next(true);
          } else {
            console.log('AuthService - No token found in signin response');
            // Check if we're authenticated anyway (cookie might be HttpOnly)
            this.checkAuthStatus().subscribe();
          }
        })
      );
  }

  logout(): void {
    this.cookieService.deleteCookie(this.tokenKey);
    this.authStateSubject.next(false);
    // Clear the cached user data
    this.currentUser = null;
  }

  getToken(): string | null {
    const token = this.cookieService.getCookie(this.tokenKey);
    console.log(`AuthService - GetToken: ${token ? 'Token found' : 'Token not found'}`);
    return token;
  }

  setToken(token: string): void {
    // Store token in a secure cookie that expires in 7 days
    this.cookieService.setCookie(this.tokenKey, token, 7);
    this.authStateSubject.next(true);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    console.log('AuthService - isAuthenticated checking token:', token ? 'Token exists' : 'No token found');
    return !!token;
  }

  
  /**
   * Check authentication status directly from the backend
   * This is useful when cookies are HttpOnly and can't be read by JavaScript
   */
  checkAuthStatus(): Observable<boolean> {
    console.log('AuthService - Checking auth status from backend');
    return this.http.get<ApiResponse<{authenticated: boolean}>>(`${this.apiUrl}/status`, { withCredentials: true })
      .pipe(
        tap(response => {
          console.log('AuthService - Auth status response:', response);
          // Update auth state based on response
          if (response && response.data) {
            const isAuthenticated = response.data.authenticated === true;
            this.authStateSubject.next(isAuthenticated);
          }
        }),
        // Map the response to a boolean value
        map((response: ApiResponse<{authenticated: boolean}>) => {
          return response && response.data ? response.data.authenticated === true : false;
        })
      )
  }

  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }
  
  /**
   * Create HTTP options with credentials for all requests
   * This ensures cookies are sent with every request
   */
  getAuthOptions(): { headers: HttpHeaders, withCredentials: boolean } {
    return {
      headers: this.getAuthHeaders(),
      withCredentials: true
    };
  }

  /**
   * Initiates the Google OAuth2 authentication flow
   */
  initiateGoogleAuth(): void {
    // Create a unique state parameter to prevent CSRF attacks
    const state = this.generateRandomState();
    // Store state in localStorage to verify when the user returns
    localStorage.setItem('oauth_state', state);
    
    // Construct the full OAuth URL with redirect back to our application
    const redirectUri = encodeURIComponent(`${window.location.origin}/oauth/callback`);
    const oauthUrl = `${this.oauthUrl}/google?redirect_uri=${redirectUri}&state=${state}`;
    
    // Redirect to the OAuth provider
    window.location.href = oauthUrl;
  }
  
  /**
   * Generates a random state parameter for OAuth security
   */
  private generateRandomState(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }
  
  /**
   * Verifies the OAuth state parameter to prevent CSRF attacks
   */
  verifyOAuthState(state: string): boolean {
    const savedState = localStorage.getItem('oauth_state');
    // Clear the saved state regardless of match
    localStorage.removeItem('oauth_state');
    // Return whether the states match
    return savedState === state;
  }

  /**
   * Handles the OAuth2 callback and stores the token
   * @param token The authentication token received from the OAuth provider
   */
  handleOAuthCallback(token: string): void {
    console.log('AuthService - Handling OAuth callback, token exists:', !!token);
    if (token) {
      console.log('AuthService - Setting token from OAuth callback');
      this.setToken(token);
      this.authStateSubject.next(true);
      
      // Verify the token was set correctly
      setTimeout(() => {
        const storedToken = this.cookieService.getCookie(this.tokenKey);
        console.log('AuthService - Verifying token was set:', storedToken ? 'Token exists in cookie' : 'Token NOT found in cookie');
      }, 100);
    } else {
      console.log('AuthService - OAuth callback received empty token');
    }
  }

  // Cache for the current user
  public currentUser: User | null = null;
  private userRequestInProgress = false;
  private maxRetries = 3;
  private retryCount = 0;

  // Get the current user data directly from cache
  getCurrentUserValue(): User | null {
    return this.currentUser;
  }

  /**
   * Get the current user information from the backend
   * @returns Observable with the current user data
   */
  getCurrentUser(): Observable<User | null> {
    // If we already have the user data cached, return it
    if (this.currentUser) {
      console.log('AuthService - Returning cached user data');
      return of(this.currentUser);
    }
    
    // If we're not authenticated, return null
    if (!this.isAuthenticated()) {
      console.log('AuthService - Not authenticated, returning null');
      return of(null);
    }
    
    // If we've exceeded max retries, return a mock user for development to prevent redirect loops
    // This is a temporary solution to prevent redirect loops during development
    if (this.retryCount >= this.maxRetries) {
      console.log('AuthService - Max retries exceeded, returning mock user');
      // Create a mock user with HOST role to prevent redirect loops
      const mockUser: User = {
        firstName: 'Test',
        email: 'test@example.com',
        userName: 'testuser',
        roles: ['HOST'],  // Using roles array instead of single role
        status: 'ACTIVE',
        provider: 'LOCAL'
      };
      this.currentUser = mockUser;
      return of(mockUser);
    }
    
    // If there's already a request in progress, return null but increment retry count
    if (this.userRequestInProgress) {
      console.log('AuthService - User request already in progress, returning null');
      this.retryCount++;
      return of(null);
    }
    
    // Mark that we're making a request
    this.userRequestInProgress = true;
    
    // Make the request to the backend
    return this.http.get<ApiResponse<User>>(`${this.baseUrl}/user`, this.getAuthOptions())
      .pipe(
        tap(response => {
          console.log('AuthService - getCurrentUser response:', response);
          // Reset retry count on success
          this.retryCount = 0;
          // Cache the user data
          this.currentUser = response && response.data ? response.data : null;
          this.userRequestInProgress = false;
        }),
        map(response => this.currentUser),
        catchError(error => {
          console.error('AuthService - Error getting current user:', error);
          this.userRequestInProgress = false;
          this.retryCount++;
          return of(null);
        })
      );
  }

  setUserRoles(roles: any): Observable<any> {

    const token = this.getToken();
    if (!token) {
      throw new Error('Authentication token not found');
    }
    
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.put<ApiResponse<any>>(`${this.baseUrl}/v1/user/role`, {}, {
      headers: headers,
      params: roles
    }).pipe(
      tap(response => {
        if (response) {
           console.log("ROLE ASSIGNED")
        }
      })
    );
  }


}
