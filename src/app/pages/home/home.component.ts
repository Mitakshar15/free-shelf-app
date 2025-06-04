import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterModule, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StorageSpaceService } from '../../services/storage-space.service';
import { StorageSpace } from '../../models/models';
import { ImageUrlPipe } from '../../pipes/image-url.pipe';
import { ImageProxyService } from '../../services/image-proxy.service';
import { finalize, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule, RouterLink, ImageUrlPipe],
  providers: [ImageProxyService]
})
export class HomeComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache
  private lastFetchTime = 0;
  private cachedSpaces: StorageSpace[] = [];
  featuredSpaces: StorageSpace[] = [];
  isLoading = true;
  error = '';

  constructor(
    private storageSpaceService: StorageSpaceService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadFeaturedSpaces();
  }

  loadFeaturedSpaces(): void {
    const now = Date.now();
    this.isLoading = true;
    this.error = '';

    this.storageSpaceService.getFeaturedSpaced()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.isLoading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (response) => {
          if (response?.data?.length) {
            this.cachedSpaces = response.data
              .filter(space => space.status === 'ACTIVE')
              .slice(0, 6);
            this.featuredSpaces = this.cachedSpaces;
            this.lastFetchTime = now;
          }
        },
        error: (error) => {
          console.error('Error loading featured spaces', error);
          this.error = 'Failed to load featured spaces. Please try again later.';
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  searchSpaces(event: Event): void {
    event.preventDefault();
    this.router.navigate(['/spaces']);
  }
}
