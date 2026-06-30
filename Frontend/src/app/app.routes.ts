import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { PublicationsComponent } from './features/posts/publications/publications.component';
import {PublicacionDetalleComponent} from './features/posts/publicacion-detalle/publicacion-detalle.component';
import { MyProfileComponent } from './features/profile/my-profile/my-profile.component';
import { LoadingComponent } from './features/loading/loading.component';
import { DashboardUsuariosComponent } from './features/dashboard/usuarios/dashboard-usuarios.component';
import { AdminGuard } from './core/guard/admin.guard';
import { DashboardEstadisticasComponent } from './features/dashboard/estadisticas/dashboard-estadisticas.component';

export const routes: Routes = [
  { path: '', redirectTo: 'publicaciones', pathMatch: 'full' },
  { path: 'loading', component: LoadingComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'publicaciones', component: PublicationsComponent }, 
  { path: 'publicaciones/:id', component: PublicacionDetalleComponent },
  { path: 'profile', component: MyProfileComponent },
  { path: 'dashboard/usuarios', component: DashboardUsuariosComponent, canActivate: [AdminGuard] },
  { path: 'dashboard/estadisticas', component: DashboardEstadisticasComponent, canActivate: [AdminGuard] },
  { path: '**', redirectTo: 'publicaciones' }
];