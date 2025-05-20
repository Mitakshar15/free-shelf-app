import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { 
  SignUpRequest, 
  SignInRequest, 
  ApiResponse 
} from '../models/models';
import { CookieService } from './cookie.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/v1/auth';
  private oauthUrl = 'http://localhost:8080/oauth2/authorize';
  private tokenKey = 'free-shelf-token';
  private authStateSubject = new BehaviorSubject<boolean>(false);
  
  // Observable for components to subscribe to authentication state changes
  public authState$ = this.authStateSubject.asObservable();

  constructor(
    private http: HttpClient,
    private cookieService: CookieService
  ) {
    // Initialize auth state based on token existence
    this.authStateSubject.next(this.isAuthenticated());
  }

  signUp(signUpRequest: SignUpRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/signup`, signUpRequest)
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
          }
        })
      );
  }

  signIn(signInRequest: SignInRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/signin`, signInRequest)
      .pipe(
        tap(response => {
          if (response.data?.token) {
            this.setToken(response.data.token);
            this.authStateSubject.next(true);
          }
        })
      );
  }

  logout(): void {
    this.cookieService.deleteCookie(this.tokenKey);
    this.authStateSubject.next(false);
  }

  getToken(): string | null {
    return this.cookieService.getCookie(this.tokenKey);
  }

  setToken(token: string): void {
    // Store token in a secure cookie that expires in 7 days
    this.cookieService.setCookie(this.tokenKey, token, 7);
    this.authStateSubject.next(true);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
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
    if (token) {
      this.setToken(token);
      this.authStateSubject.next(true);
    }
  }
}
