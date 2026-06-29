import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class SessionService {
  private timer: any;

  constructor(private authService: AuthService) {}

  iniciarContadorSesion() {
    if (this.timer) clearTimeout(this.timer);

    this.timer = setTimeout(() => {
      this.preguntarExtension();
    }, 600000); 
  }

  private preguntarExtension() {
    const confirmar = confirm("Tu sesión expira en 5 minutos. ¿Deseas extenderla?");
    if (confirmar) {
      this.authService.refrescarSesion().subscribe({
        next: () => {
          alert("Sesión extendida.");
          this.iniciarContadorSesion(); 
        },
        error: (err) => {
          alert("No se pudo refrescar la sesión. Debes iniciar sesión nuevamente.");
          this.authService.forzarLogout();
        }
      });
    } else {
      this.authService.forzarLogout();
    }
  }
}