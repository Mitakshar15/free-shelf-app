import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterModule, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule, NgIf, UpperCasePipe } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { User } from '../../models/models';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLink, RouterLinkActive, NgIf, UpperCasePipe]
})
export class NavbarComponent implements OnInit, OnDestroy {
  isAuthenticated = false;
  user: User | null = null;
  isMenuOpen = false;
  private authSubscription: Subscription = new Subscription();

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Initial check of auth status
    this.checkAuthStatus();
    
    // Subscribe to auth state changes
    this.authSubscription = this.authService.authState$.subscribe(isAuthenticated => {
      this.isAuthenticated = isAuthenticated;
      if (isAuthenticated) {
        this.loadUserProfile();
      } else {
        this.user = null;
      }
    });
  }

  ngOnDestroy(): void {
    // Clean up subscriptions to prevent memory leaks
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  checkAuthStatus(): void {
    this.isAuthenticated = this.authService.isAuthenticated();
    if (this.isAuthenticated) {
      this.loadUserProfile();
    }
  }

  loadUserProfile(): void {
    this.userService.getUserProfile().subscribe({
      next: (response) => {
        if (response.data) {
          this.user = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading user profile', error);
        // If unauthorized, clear token
        if (error.status === 401) {
          this.authService.logout();
          this.isAuthenticated = false;
          this.router.navigate(['/login']);
        }
      }
    });
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  logout(): void {
    // Clear token using AuthService
    this.authService.logout();
    
    // Reset user data (this will also happen via the auth state subscription)
    this.isAuthenticated = false;
    this.user = null;
    
    // Close menu
    this.isMenuOpen = false;
    
    // Redirect to login page
    this.router.navigate(['/login']);
  }
}
