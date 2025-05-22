import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { User, Address } from '../../models/models';
import { ProfileBasicDetailsComponent } from './components/profile-basic-details.component';
import { ProfileAddressesComponent } from './components/profile-addresses.component';
import { ProfileStorageSpacesComponent } from './components/profile-storage-spaces.component';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ProfileBasicDetailsComponent,
    ProfileAddressesComponent,
    ProfileStorageSpacesComponent
  ]
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  addresses: Address[] = [];
  activeTab: 'basic-details' | 'addresses' | 'storage-spaces' = 'basic-details';
  isLoading = true;
  error: string | null = null;

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.loadUserProfile();
    this.loadUserAddresses();
  }

  loadUserProfile(): void {
    this.isLoading = true;
    this.userService.getUserProfile().subscribe({
      next: (response) => {
        if (response.data) {
          this.user = response.data;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading user profile', error);
        this.error = 'Failed to load profile. Please try again later.';
        this.isLoading = false;
      }
    });
  }

  loadUserAddresses(): void {
    this.userService.getUserAddresses().subscribe({
      next: (response) => {
        if (response.data) {
          this.addresses = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading user addresses', error);
      }
    });
  }

  setActiveTab(tab: 'basic-details' | 'addresses' | 'storage-spaces'): void {
    this.activeTab = tab;
  }

  onProfileUpdated(event: any): void {
    if (event && typeof event === 'object' && 'firstName' in event) {
      this.user = event as User;
    }
  }

  onAddressesUpdated(): void {
    this.loadUserAddresses();
  }
}
