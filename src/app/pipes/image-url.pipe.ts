import { Pipe, PipeTransform } from '@angular/core';
import { ImageProxyService } from '../services/image-proxy.service';

@Pipe({
  name: 'imageUrl',
  standalone: true
})
export class ImageUrlPipe implements PipeTransform {
  constructor(private imageProxyService: ImageProxyService) {}

  transform(path: string | undefined): string {
    if (!path) {
      return 'assets/images/placeholder.png';
    }
    
    return this.imageProxyService.getImageUrlSync(path);
  }
}
