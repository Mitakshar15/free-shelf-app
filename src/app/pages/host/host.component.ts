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
    private userService: UserService
  ) { }

  ngOnInit(): void {
    // Check if user is a HOST
    this.authService.getCurrentUser().subscribe(user => {
      if (!user || !user.role || user.role !== 'HOST') {
        // Redirect non-HOST users to become a host page
        this.router.navigate(['/become-host']);
      }
    });
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
