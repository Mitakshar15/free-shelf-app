import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StorageSpaceService } from '../../../services/storage-space.service';
import { StorageSpace } from '../../../models/models';
import { ImageUrlPipe } from '../../../pipes/image-url.pipe';
import { ImageProxyService } from '../../../services/image-proxy.service';

@Component({
  selector: 'app-profile-storage-spaces',
  templateUrl: './profile-storage-spaces.component.html',
  styleUrls: ['./profile-storage-spaces.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, ImageUrlPipe],
  providers: [ImageProxyService]
})
export class ProfileStorageSpacesComponent implements OnInit {
  storageSpaces: StorageSpace[] = [];
  isLoading = true;
  error: string | null = null;
  
  constructor(
    private storageSpaceService: StorageSpaceService,
    private router: Router,
    private imageProxyService: ImageProxyService
  ) {}

  ngOnInit(): void {
    this.loadStorageSpaces();
  }

  loadStorageSpaces(): void {
    this.isLoading = true;
    this.error = null;
    
    this.storageSpaceService.getStorageSpaces().subscribe({
      next: (response) => {
        if (response.data) {
          this.storageSpaces = response.data;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading storage spaces', error);
        this.error = 'Failed to load storage spaces. Please try again later.';
        this.isLoading = false;
      }
    });
  }

  navigateToAddSpace(): void {
    this.router.navigate(['/host']);
  }

  getStatusClass(status: string | undefined): string {
    if (!status) return '';
    
    switch (status.toLowerCase()) {
      case 'active':
        return 'status-active';
      case 'draft':
        return 'status-draft';
      case 'inactive':
        return 'status-inactive';
      case 'booked':
        return 'status-booked';
      case 'deleted':
        return 'status-deleted';
      default:
        return '';
    }
  }

  formatPrice(price: number | undefined): string {
    if (price === undefined) return 'N/A';
    return `$${price.toFixed(2)}/month`;
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getSpaceTypeLabel(spaceType: string | undefined): string {
    if (!spaceType) return 'Unknown';
    
    // Convert SNAKE_CASE to Title Case
    return spaceType.toLowerCase()
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  getDefaultImageUrl(): string {
    return 'assets/images/default-space.jpg';
  }

  getSpaceImageUrl(space: StorageSpace): string {
    if (space.images && space.images.length > 0) {
      const primaryImage = space.images.find(img => img.primary);
      const imageUrl = primaryImage ? primaryImage.imageUrl : space.images[0].imageUrl;
      return this.imageProxyService.getImageUrlSync(imageUrl);
    }
    return this.getDefaultImageUrl();
  }
}
