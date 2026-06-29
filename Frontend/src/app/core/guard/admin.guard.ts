import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      const role = user.role || user.data?.role;
      
      if (role === 'administrador') {
        return true;
      }
    }

    alert('Acceso denegado: Se requiere perfil de Administrador');
    this.router.navigate(['/publicaciones']);
    return false;
  }
}