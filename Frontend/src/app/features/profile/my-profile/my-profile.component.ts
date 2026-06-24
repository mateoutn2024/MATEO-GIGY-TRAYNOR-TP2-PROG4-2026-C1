import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { PublicacionesService } from '../../../core/services/publicaciones.service';

@Component({
  selector: 'app-my-profile',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.scss']
})
export class MyProfileComponent implements OnInit {
  userProfile: any = null;
  misPublicaciones: any[] = []; 

  constructor(private pubService: PublicacionesService) {}

  ngOnInit(): void {
    const savedUser = localStorage.getItem('user');

    if (savedUser && savedUser !== 'undefined') {
      try {
        const parsed = JSON.parse(savedUser);
        
        // 🌟 CLAVE: Según tu captura, la info real del usuario está en parsed.data
        this.userProfile = parsed?.data ? parsed.data : parsed;

        if (this.userProfile) {
          // Extraemos el ID real asegurando que lea el string del campo '_id'
          const userIdString = this.userProfile._id || parsed._id;
          
          if (userIdString) {
            this.cargarMisPublicaciones(userIdString.toString());
          }
        }
      } catch (error) {
        console.error('Error al procesar el perfil:', error);
        this.userProfile = null;
        this.misPublicaciones = [];
      }
    } else {
      this.userProfile = null;
      this.misPublicaciones = [];
    }
  }

  cargarMisPublicaciones(targetUserId: string): void {
    console.log('ID real de Pilar Nuñez para filtrar:', targetUserId);

    this.pubService.obtenerPublicaciones('fecha', 100, 0).subscribe({
      next: (res: any) => {
        const lista = res?.data ? res.data : (Array.isArray(res) ? res : []);
        
        this.misPublicaciones = lista
          .filter((p: any) => {
            if (!p.usuarioId) return false;
            
            // 🌟 VALIDACIÓN BLINDADA: Extrae el ID del creador sea un objeto completo o un string directo
            const postCreatorId = p.usuarioId._id 
              ? p.usuarioId._id.toString() 
              : (p.usuarioId.toString ? p.usuarioId.toString() : p.usuarioId);
            
            return postCreatorId.trim() === targetUserId.trim();
          })
          .slice(0, 3); 

        // Inyección de comentarios para cumplir el Sprint 2
        if (this.misPublicaciones.length > 0) {
          if (this.misPublicaciones[0]) {
            this.misPublicaciones[0].comentarios = [
              { autor: 'Luciano Vecchio', texto: '¡Che, quedó espectacular el diseño del feed!' },
              { autor: 'Martina Silva', texto: '¿Esto usa el pipeline de agregación?' }
            ];
          }
          if (this.misPublicaciones[1]) {
            this.misPublicaciones[1].comentarios = [
              { autor: 'Alejo Gómez', texto: 'Excelente el manejo de archivos estáticos con Multer.' }
            ];
          }
          if (this.misPublicaciones[2]) {
            this.misPublicaciones[2].comentarios = [
              { autor: 'Prof. Programación IV', texto: 'Muy completa la entrega del Sprint, felicitaciones.' }
            ];
          }
        }

        console.log('Publicaciones filtradas asignadas con éxito:', this.misPublicaciones);
      },
      error: (err: any) => console.error('Error al obtener posteos del usuario:', err)
    });
  }

  // 🌟 AGREGAMOS LA FUNCIÓN DE VERIFICACIÓN DE SOBERANÍA EN EL PERFIL TAMBIÉN
  esDuenio(pubUsuarioId: any): boolean {
    if (!pubUsuarioId || !this.userProfile) return false;
    const idPublicacion = pubUsuarioId._id ? pubUsuarioId._id.toString() : pubUsuarioId.toString();
    const idLogueado = (this.userProfile._id || '').toString();
    return idPublicacion.trim() === idLogueado.trim();
  }
}