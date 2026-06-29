import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { PublicationsComponent } from './features/posts/publications/publications.component';
import {PublicacionDetalleComponent} from './features/posts/publicacion-detalle/publicacion-detalle.component';
import { MyProfileComponent } from './features/profile/my-profile/my-profile.component';
import { LoadingComponent } from './features/loading/loading.component';

export const routes: Routes = [
  { path: '', component: LoadingComponent, pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'publications', component: PublicationsComponent }, 
  { path: 'publicaciones/:id', component: PublicacionDetalleComponent },
  { path: 'profile', component: MyProfileComponent },
  { path: '**', redirectTo: '' }
];