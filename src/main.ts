import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { routes } from './app/app-routing.module';
import { AuthService } from './app/services/auth.service';
import { UserService } from './app/services/user.service';
import { StorageSpaceService } from './app/services/storage-space.service';
import { BookingService } from './app/services/booking.service';
import { provideHttpClient } from '@angular/common/http';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    AuthService,
    UserService,
    StorageSpaceService,
    BookingService
  ]
}).catch(err => console.error(err));
