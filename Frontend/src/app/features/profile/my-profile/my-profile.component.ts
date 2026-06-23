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
        this.userProfile = parsed?.data ? parsed.data : parsed;

        if (this.userProfile) {
          const userId = this.userProfile._id || parsed._id;
          
          if (userId) {
            this.cargarMisPublicaciones(userId);
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

cargarMisPublicaciones(userId: any): void {
    const targetUserId = userId._id ? userId._id.toString() : userId.toString();
    console.log('ID buscado en el filtro (String):', targetUserId);

    this.pubService.obtenerPublicaciones('fecha', 100, 0).subscribe({
      next: (res: any) => {
        const lista = res?.data ? res.data : (Array.isArray(res) ? res : []);
        
        this.misPublicaciones = lista
          .filter((p: any) => {
            if (!p.usuarioId) return false;
            
            const postCreatorId = p.usuarioId._id ? p.usuarioId._id.toString() : p.usuarioId.toString();
            
            return postCreatorId === targetUserId;
          })
          .slice(0, 3); 

        console.log('Últimas 3 publicaciones asignadas al perfil:', this.misPublicaciones);
      },
      error: (err: any) => console.error('Error al obtener posteos del usuario:', err)
    });
  }}