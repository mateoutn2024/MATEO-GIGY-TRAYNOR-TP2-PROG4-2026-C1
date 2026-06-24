import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { PublicationsComponent } from './features/posts/publications/publications.component'; 
import { MyProfileComponent } from './features/profile/my-profile/my-profile.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'publications', component: PublicationsComponent }, 
  { path: 'profile', component: MyProfileComponent },
  { path: '**', redirectTo: 'login' }
];