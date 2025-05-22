import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Components
import { HomeComponent } from './pages/home/home.component';
import { SignupComponent } from './components/auth/signup/signup.component';
import { LoginComponent } from './components/auth/login/login.component';
import { HostComponent } from './pages/host/host.component';
import { ProfileComponent } from './pages/profile/profile.component';

// Guards
import { authGuard } from './guards/auth.guard';
import { nonAuthGuard } from './guards/non-auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'signup', component: SignupComponent, canActivate: [nonAuthGuard] },
  { path: 'login', component: LoginComponent, canActivate: [nonAuthGuard] },
  { path: 'host', component: HostComponent, canActivate: [authGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  // Protected routes will be added as they are implemented
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
