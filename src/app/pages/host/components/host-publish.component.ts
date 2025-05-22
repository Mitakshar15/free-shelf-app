import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { StorageSpaceService } from '../../../services/storage-space.service';
import { StorageSpace } from '../../../models/models';
import { CommonModule, DatePipe } from '@angular/common';

@Component({
  selector: 'app-host-publish',
  templateUrl: './host-publish.component.html',
  styleUrls: ['./host-publish.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    DatePipe
  ]
})
export class HostPublishComponent implements OnInit {
  @Output() previousStep = new EventEmitter<void>();
  
  storageSpaceId: number | null = null;
  storageSpace: StorageSpace | null = null;
  loading = false;
  publishing = false;
  error = '';
  success = '';
  
  constructor(
    private storageSpaceService: StorageSpaceService,
    private router: Router
  ) { }

  ngOnInit(): void {
    const spaceId = localStorage.getItem('currentStorageSpaceId');
    if (spaceId) {
      this.storageSpaceId = parseInt(spaceId, 10);
      this.loadStorageSpace();
    } else {
      this.error = 'No storage space found. Please go back and create a space first.';
    }
  }

  loadStorageSpace(): void {
    if (!this.storageSpaceId) return;
    
    this.loading = true;
    this.storageSpaceService.getStorageSpaces().subscribe({
      next: (response) => {
        this.loading = false;
        if (response.data) {
          const space = response.data.find(space => space.id === this.storageSpaceId);
          if (space) {
            this.storageSpace = space;
          } else {
            this.error = 'Storage space not found.';
          }
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Failed to load storage space. Please try again.';
        console.error('Error loading storage space:', err);
      }
    });
  }

  publishSpace(): void {
    if (!this.storageSpaceId) return;
    
    this.publishing = true;
    this.error = '';
    this.success = '';
    
    this.storageSpaceService.publishStorageSpace(this.storageSpaceId).subscribe({
      next: (response) => {
        this.publishing = false;
        if (response.status?.statusCode === 201 || response.status?.statusCode === 200) {
          this.success = 'Your storage space has been published successfully!';
          
          // Clear the current storage space ID from localStorage
          setTimeout(() => {
            localStorage.removeItem('currentStorageSpaceId');
            this.router.navigate(['/spaces/my']);
          }, 2000);
        } else {
          this.error = response.status?.statusMessage || 'Failed to publish storage space. Please try again.';
        }
      },
      error: (err) => {
        this.publishing = false;
        this.error = err.error?.status?.statusMessage || 'Failed to publish storage space. Please try again.';
        console.error('Error publishing storage space:', err);
      }
    });
  }

  onBack(): void {
    this.previousStep.emit();
  }

  getPrimaryImageUrl(): string {
    if (!this.storageSpace || !this.storageSpace.images || this.storageSpace.images.length === 0) {
      return 'assets/images/placeholder-image.jpg'; // Provide a default placeholder image path
    }
    
    const primaryImage = this.storageSpace.images.find(img => img.primary);
    return primaryImage ? primaryImage.imageUrl : this.storageSpace.images[0].imageUrl;
  }
  
  /**
   * Safely check if the storage space has images
   */
  hasImages(): boolean {
    return !!this.storageSpace?.images && this.storageSpace.images.length > 0;
  }
  
  /**
   * Safely check if the storage space has multiple images
   */
  hasMultipleImages(): boolean {
    return !!this.storageSpace?.images && this.storageSpace.images.length > 1;
  }
  
  /**
   * Safely check if the storage space has features
   */
  hasFeatures(): boolean {
    return !!this.storageSpace?.features && this.storageSpace.features.length > 0;
  }

  getFeatureLabel(feature: string): string {
    const featureMap: Record<string, string> = {
      'CLIMATE_CONTROLLED': 'Climate Controlled',
      'SECURITY_CAMERA': 'Security Camera',
      'TWENTY_FOUR_HOUR_ACCESS': 'Twenty-Four Hour Access',
      'DRIVE_UP_ACCESS': 'Drive-Up Access',
      'INDOOR': 'Indoor',
      'OUTDOOR': 'Outdoor',
      'LOCKED': 'Locked',
      'SHELVING': 'Shelving',
      'ELECTRICITY': 'Electricity',
      'LIGHTING': 'Lighting',
      'ALARM_SYSTEM': 'Alarm System'
    };
    
    return featureMap[feature] || feature;
  }

  getSpaceTypeLabel(type: string): string {
    const typeMap: Record<string, string> = {
      'GARAGE': 'Garage',
      'BASEMENT': 'Basement',
      'ATTIC': 'Attic',
      'STORAGE_UNIT': 'Storage Unit',
      'ROOM': 'Room',
      'SHED': 'Shed',
      'OTHER': 'Other'
    };
    
    return typeMap[type] || type;
  }
}
