import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { StorageSpaceService } from '../../../services/storage-space.service';
import { SpaceImage } from '../../../models/models';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImageUrlPipe } from '../../../pipes/image-url.pipe';
import { ImageProxyService } from '../../../services/image-proxy.service';

@Component({
  selector: 'app-host-photos',
  templateUrl: './host-photos.component.html',
  styleUrls: ['./host-photos.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ImageUrlPipe
  ],
  providers: [
    ImageProxyService
  ]
})
export class HostPhotosComponent implements OnInit {
  @Output() nextStep = new EventEmitter<void>();
  @Output() previousStep = new EventEmitter<void>();
  
  storageSpaceId: number | null = null;
  images: SpaceImage[] = [];
  selectedFiles: File[] = [];
  captions: string[] = [];
  loading = false;
  error = '';
  success = '';
  uploading = false;
  
  constructor(
    private storageSpaceService: StorageSpaceService,
    private imageProxyService: ImageProxyService
  ) { }

  ngOnInit(): void {
    const spaceId = localStorage.getItem('currentStorageSpaceId');
    if (spaceId) {
      this.storageSpaceId = parseInt(spaceId, 10);
      this.loadSpaceImages();
    } else {
      this.error = 'No storage space found. Please go back and create a space first.';
    }
  }

  loadSpaceImages(): void {
    if (!this.storageSpaceId) return;
    
    this.loading = true;
    this.storageSpaceService.getStorageSpaces().subscribe({
      next: (response) => {
        this.loading = false;
        if (response.data) {
          const space = response.data.find(space => space.id === this.storageSpaceId);
          if (space && space.images) {
            this.images = space.images;
          }
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Failed to load images. Please try again.';
        console.error('Error loading images:', err);
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const files = Array.from(input.files);
      
      // Check if adding these files would exceed the 5 image limit
      if (this.images.length + this.selectedFiles.length + files.length > 5) {
        this.error = 'You can upload a maximum of 5 images.';
        return;
      }
      
      // Add the new files to the selected files array
      this.selectedFiles = [...this.selectedFiles, ...files];
      
      // Add empty captions for the new files
      files.forEach(() => this.captions.push(''));
    }
  }

  removeSelectedFile(index: number): void {
    this.selectedFiles = this.selectedFiles.filter((_, i) => i !== index);
    this.captions = this.captions.filter((_, i) => i !== index);
  }

  updateCaption(index: number, event: Event): void {
    const target = event.target as HTMLInputElement;
    this.captions[index] = target.value;
  }

  createObjectURL(file: File): string {
    return URL.createObjectURL(file);
  }

  uploadImages(): void {
    if (!this.storageSpaceId || this.selectedFiles.length === 0) return;
    
    this.uploading = true;
    this.error = '';
    this.success = '';
    
    this.storageSpaceService.addStorageSpaceImages(this.storageSpaceId, this.selectedFiles, this.captions).subscribe({
      next: (response) => {
        this.uploading = false;
        if (response.data) {
          this.success = 'Images uploaded successfully!';
          this.images = [...this.images, ...response.data];
          this.selectedFiles = [];
          this.captions = [];
        } else {
          this.error = 'Failed to upload images. Please try again.';
        }
      },
      error: (err) => {
        this.uploading = false;
        this.error = err.error?.status?.statusMessage || 'Failed to upload images. Please try again.';
        console.error('Error uploading images:', err);
      }
    });
  }

  setAsPrimary(imageId: number): void {
    if (!this.storageSpaceId) return;
    
    this.loading = true;
    this.error = '';
    
    this.storageSpaceService.setImageAsPrimary(this.storageSpaceId, imageId).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.data) {
          this.images = response.data;
          this.success = 'Primary image updated successfully!';
        } else {
          this.error = 'Failed to update primary image. Please try again.';
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.status?.statusMessage || 'Failed to update primary image. Please try again.';
        console.error('Error updating primary image:', err);
      }
    });
  }

  onContinue(): void {
    if (this.images.length === 0) {
      this.error = 'Please upload at least one image before continuing.';
      return;
    }
    
    // Check if there's a primary image
    const hasPrimary = this.images.some(image => image.primary);
    if (!hasPrimary && this.images.length > 0) {
      // Set the first image as primary if none is set
      this.setAsPrimary(this.images[0].id!);
    }
    
    this.nextStep.emit();
  }

  onBack(): void {
    this.previousStep.emit();
  }
}
