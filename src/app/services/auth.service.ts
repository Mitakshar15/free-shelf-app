import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
import {
  SignUpRequest,
  SignInRequest,
  ApiResponse,
  User, UserProfile
} from '../models/models';
import { CookieService } from './cookie.service';
import { Router } from '@angular/router';
import {ApiService} from './api.service';
import {API_CONFIG} from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private tokenKey = API_CONFIG.AUTH_TOKEN_KEY;
  private authStateSubject = new BehaviorSubject<boolean>(false);

  // Observable for components to subscribe to authentication state changes
  public authState$ = this.authStateSubject.asObservable();

  constructor(
    private http: HttpClient,
    private cookieService: CookieService,
    private router: Router,
    private api : ApiService
  ) {
    // Initialize auth state based on token existence
    this.authStateSubject.next(this.isAuthenticated());

    this.getCurrentUser().subscribe(response => {
      if (response.data) {
        const hasUnassignedRole = response.data.roles && response.data.roles.includes('UNASSIGNED');

        // Check if user needs to select roles
        if (hasUnassignedRole) {
          // If at home or oauth callback, redirect to role selection
            console.log('User has UNASSIGNED role, redirecting to role selection');
            this.router.navigate(['/select-role']);
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

  signUp(request: SignUpRequest): Observable<ApiResponse<any>> {
    return this.api.post<ApiResponse<any>>(API_CONFIG.ENDPOINTS.AUTH.REGISTER, request).pipe(
      tap(response => {
        if (response?.data?.token) {
          console.log('AuthService - Token found, setting token and updating auth state');
          this.setToken(response.data.token);
          this.authStateSubject.next(true);
        }
        else {
          console.log('AuthService - No token found in signin response');
        }
      })
    );
  }

  signIn(request: SignInRequest): Observable<ApiResponse<any>> {
    return this.api.post<ApiResponse<any>>(API_CONFIG.ENDPOINTS.AUTH.LOGIN, request).pipe(
      tap(response => {
        if (response?.data?.token) {
          localStorage.setItem(API_CONFIG.AUTH_TOKEN_KEY, response.data.token);
          console.log('AuthService - Token found in signin response');
          this.setToken(response.data.token);
          this.authStateSubject.next(true);
        }
        else {
          console.log('AuthService - No token found in signin response');
        }
      })
    );
  }

  logout(): void {
    this.cookieService.deleteCookie(this.tokenKey);
    this.authStateSubject.next(false);
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
    const oauthUrl = API_CONFIG.OAUTH_ENDPOINT+`/google?redirect_uri=${redirectUri}&state=${state}`;
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
  public currentUser: any | null = null;
  private userRequestInProgress = false;
  private maxRetries = 3;
  private retryCount = 0;

  // Get the current user data directly from cache
  getCurrentUserValue(): User | null {
    return this.currentUser;
  }

  getCurrentUser(): Observable<ApiResponse<any>> {
    const token = this.getToken();
    if (!token) {
      return of({ data: null as unknown as UserProfile } as ApiResponse<any>);
    }

    return this.api.get<ApiResponse<any>>(API_CONFIG.ENDPOINTS.USER.PROFILE,this.getAuthOptions()).pipe(
      tap(response => {
        if (response?.data) {
          this.currentUser = response && response.data ? response.data : null;
          this.userRequestInProgress = false;
        }
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

    return this.api.put<ApiResponse<any>>(API_CONFIG.ENDPOINTS.USER.ADD_ROLE, {}, {
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
