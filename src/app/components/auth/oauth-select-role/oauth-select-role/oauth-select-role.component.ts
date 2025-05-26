// oauth-select-role.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../../services/auth.service';
import { CommonModule } from '@angular/common';

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
    private authService: AuthService
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
    this.authService.getCurrentUser().subscribe(user => {
      if (user && user.roles) {
        this.selectedRoles = user.roles.filter(role => 
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

    this.http.put(`${this.authService.baseUrl}/user/role`, {}, {
      headers: headers,
      params: {
        'Roles': this.selectedRoles
      }
    }).subscribe({
      next: (response: any) => {
        if (response && response.status?.statusCode === 200) {
          // Update user's role status in auth service
          this.authService.getCurrentUser().subscribe();
          // Navigate to homepage after successful role selection
          this.router.navigate(['/home']);
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