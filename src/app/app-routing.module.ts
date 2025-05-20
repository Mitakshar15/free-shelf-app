import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Components
import { HomeComponent } from './pages/home/home.component';
import { SignupComponent } from './components/auth/signup/signup.component';
import { LoginComponent } from './components/auth/login/login.component';
import { OAuthCallbackComponent } from './components/auth/oauth-callback/oauth-callback.component';

// Guards
import { authGuard } from './guards/auth.guard';
import { nonAuthGuard } from './guards/non-auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'signup', component: SignupComponent, canActivate: [nonAuthGuard] },
  { path: 'login', component: LoginComponent, canActivate: [nonAuthGuard] },
  { path: 'oauth/callback', component: OAuthCallbackComponent },
  // Protected routes will be added as they are implemented
  // { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  // { path: 'bookings', component: BookingsComponent, canActivate: [authGuard] },
  // { path: 'spaces/my', component: MySpacesComponent, canActivate: [authGuard] },
  // Add more routes as needed
  { path: '**', redirectTo: '' } // Redirect to home for any undefined routes
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
