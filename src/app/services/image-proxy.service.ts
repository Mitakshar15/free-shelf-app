import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class ImageProxyService {
  // File server URL
  private readonly FILE_SERVER_URL = 'http://localhost:3000/api/serve-file';
  // Use a placeholder image when the actual image can't be loaded
  private readonly PLACEHOLDER_IMAGE = 'assets/images/placeholder.png';
  // Cache for processed image URLs
  private readonly IMAGE_CACHE = new Map<string, string>();

  
  constructor(
    private http: HttpClient,
    private sanitizer: DomSanitizer
  ) { }
  
  /**
   * This method is no longer used but kept for compatibility
   */
  getImageUrl(path: string): Observable<SafeUrl> {
    const url = this.getImageUrlSync(path);
    return of(this.sanitizer.bypassSecurityTrustUrl(url));
  }
  
  /**
   * Synchronously converts a file system path to a web-accessible URL
   * @param path The file system path to convert
   * @returns A URL string that can be used in an img src attribute
   */
  getImageUrlSync(path: string): string {
    // If path is null or undefined, return placeholder
    if (!path) {
      return 'assets/images/placeholder.png';
    }
    
    // If path is already a web URL, return it as is
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    
    // Check if we have this path cached
    if (this.IMAGE_CACHE.has(path)) {
      return this.IMAGE_CACHE.get(path)!;
    }
    
    // Log the original path for debugging
    console.log('Processing image path:', path);
    
    try {
      // Extract the filename from the path
      const fileName = path.split('/').pop();
      
      if (!fileName) {
        console.error('Could not extract filename from path:', path);
        return this.PLACEHOLDER_IMAGE;
      }
      
      // Create a URL that will serve the file directly from the file system
      // This uses our Express server endpoint to serve local files
      const imageUrl = `${this.FILE_SERVER_URL}?path=${encodeURIComponent(path)}`;
      console.log('Generated image URL:', imageUrl);
      
      // Cache the URL for future use
      this.IMAGE_CACHE.set(path, imageUrl);
      
      return imageUrl;
    } catch (error) {
      console.error('Error processing image path:', path, error);
      return this.PLACEHOLDER_IMAGE;
    }
  }
  

}
