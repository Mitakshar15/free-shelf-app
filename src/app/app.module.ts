import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';

// Services
import { AuthService } from './services/auth.service';
import { UserService } from './services/user.service';
import { StorageSpaceService } from './services/storage-space.service';
import { BookingService } from './services/booking.service';
import { OauthSelectRoleComponent } from './components/auth/oauth-select-role/oauth-select-role/oauth-select-role.component';

@NgModule({
  declarations: [
    OauthSelectRoleComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [
    AuthService,
    UserService,
    StorageSpaceService,
    BookingService
  ]
})
export class AppModule { }

