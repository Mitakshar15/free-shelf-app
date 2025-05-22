import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { HostBasicDetailsComponent } from './components/host-basic-details.component';
import { HostPhotosComponent } from './components/host-photos.component';
import { HostPublishComponent } from './components/host-publish.component';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-host',
  templateUrl: './host.component.html',
  styleUrls: ['./host.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HostBasicDetailsComponent,
    HostPhotosComponent,
    HostPublishComponent
  ]
})
export class HostComponent implements OnInit {
  currentStep = 1;
  totalSteps = 3;
  
  constructor(
    private router: Router,
    private authService: AuthService,
  ) { }

  ngOnInit(): void {
    // Check if user has HOST role, but only redirect if we're certain they don't
    this.authService.getCurrentUser().subscribe(user => {
      if (user) {
        // We have a user, check if they have HOST role
        const isHost = this.hasHostRole(user);
        
        if (!isHost) {
          console.log('User does not have HOST role, redirecting to become-host page');
          this.router.navigate(['/become-host']);
        } else {
          console.log('User has HOST role, staying on host page');
        }
      } else {
        // If we don't have a user yet, don't redirect - the auth service will handle retries
        console.log('No user data yet, waiting for auth service to retry');
      }
    });
  }
  
  /**
   * Check if the user has the HOST role
   * @param user The user to check
   * @returns true if the user has the HOST role, false otherwise
   */
  private hasHostRole(user: any): boolean {
    // Check the roles array first (new API format)
    if (user.roles && Array.isArray(user.roles)) {
      return user.roles.includes('HOST');
    }
    
    // Fallback to the role property (old format)
    if (user.role) {
      return user.role === 'HOST';
    }
    
    return false;
  }

  nextStep(): void {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  goToStep(step: number): void {
    if (step >= 1 && step <= this.totalSteps) {
      this.currentStep = step;
    }
  }
}
