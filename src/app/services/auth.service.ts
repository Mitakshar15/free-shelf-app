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
}
