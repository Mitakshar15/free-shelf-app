import { Component, OnInit } from '@angular/core';
import { Router, RouterModule, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StorageSpaceService } from '../../services/storage-space.service';
import { StorageSpace } from '../../models/models';
import { ImageUrlPipe } from '../../pipes/image-url.pipe';
import { ImageProxyService } from '../../services/image-proxy.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLink, ImageUrlPipe],
  providers: [ImageProxyService]
})
export class HomeComponent implements OnInit {
  featuredSpaces: StorageSpace[] = [];
  isLoading = true;
  error = '';

  constructor(
    private storageSpaceService: StorageSpaceService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadFeaturedSpaces();
  }

  loadFeaturedSpaces(): void {
    this.isLoading = true;
    this.storageSpaceService.getStorageSpaces().subscribe({
      next: (response) => {
        if (response.data) {
          // Filter for active spaces and take the first 6
          this.featuredSpaces = response.data
            .filter(space => space.status === 'ACTIVE')
            .slice(0, 6);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading featured spaces', error);
        this.error = 'Failed to load featured spaces. Please try again later.';
        this.isLoading = false;
      }
    });
  }

  searchSpaces(event: Event): void {
    event.preventDefault();
    this.router.navigate(['/spaces']);
  }
}
