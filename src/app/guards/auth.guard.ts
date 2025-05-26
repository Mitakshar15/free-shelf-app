import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  // Check if user is authenticated
  if (!authService.isAuthenticated()) {
    // Store the attempted URL for redirecting after login
    router.navigate(['/login'], { 
      queryParams: { returnUrl: state.url }
    });
    return false;
  }

  // Get current user's roles
  const user = authService.getCurrentUserValue();
  if (user && user.roles && user.roles.includes('UNASSIGNED')) {
    // If user has UNASSIGNED role and is not on the role selection page
    if (state.url !== '/select-role') {
      router.navigate(['/select-role']);
      return false;
    }
    return true;
  }

  // Allow access to all other routes for authenticated users with assigned roles
  return true;
};
