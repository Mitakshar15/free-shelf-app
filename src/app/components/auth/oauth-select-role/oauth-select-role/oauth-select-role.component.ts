// oauth-select-role.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../../services/auth.service';
import { CommonModule } from '@angular/common';
import {ApiService} from '../../../../services/api.service';
import {API_CONFIG} from '../../../../config/api.config';

@Component({
  selector: 'app-oauth-select-role',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './oauth-select-role.component.html',
  styleUrls: ['./oauth-select-role.component.css']
})
export class OauthSelectRoleComponent implements OnInit {
  availableRoles: string[] = ['HOST', 'RENTER'];
  selectedRoles: string[] = [];
  isSubmitting = false;
  errorMessage = '';

  constructor(
    private router: Router,
    private http: HttpClient,
    private authService: AuthService,
    private api: ApiService
  ) {
    console.log('OauthSelectRoleComponent initialized');
  }

  ngOnInit(): void {
    console.log('OauthSelectRoleComponent ngOnInit called');
    console.log('Available roles:', this.availableRoles);

    // Check if user is authenticated
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    // Get current user's roles to pre-select them
    this.authService.getCurrentUser().subscribe(response => {
      if (response && response.data.roles) {
        this.selectedRoles = response.data.roles.filter((role: string) =>
          this.availableRoles.includes(role) &&
          role !== 'UNASSIGNED'
        );
      }
    });
  }

  toggleRoleSelection(role: string): void {
    const index = this.selectedRoles.indexOf(role);
    if (index === -1) {
      this.selectedRoles.push(role);
    } else {
      this.selectedRoles.splice(index, 1);
    }
  }

  submitRoles(): void {
    if (this.selectedRoles.length === 0) {
      this.errorMessage = 'Please select at least one role';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.api.put(API_CONFIG.ENDPOINTS.USER.ADD_ROLE, {}, {
      headers: headers,
      params: {
        'Roles': this.selectedRoles
      }
    }).subscribe({
      next: (response: any) => {
        if (response && response.status?.statusCode === 200) {
          this.authService.currentUser = null;
          this.authService.getCurrentUser().subscribe(user => {
            if (user) {
              this.authService.currentUser = user;
              this.router.navigate(['/home']);
            }
          });
        } else {
          this.errorMessage = response.message || 'Failed to update roles. Please try again.';
        }
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Error updating user roles:', error);
        this.errorMessage = error.error?.message || 'An error occurred while updating roles. Please try again.';
        this.isSubmitting = false;
      }
    });
  }
}
