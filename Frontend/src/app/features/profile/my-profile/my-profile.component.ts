import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PublicacionesService } from '../../../core/services/publicaciones.service'; 

interface User {
  _id?: string; 
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  birthDate: string;
  description: string;
  role: string;
  avatarUrl?: string;
}

@Component({
  selector: 'app-my-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-profile.component.html'
})
export class MyProfileComponent implements OnInit {
  userProfile: User | null = null;
  misUltimasPublicaciones: any[] = []; 

  constructor(private pubService: PublicacionesService) {}

  ngOnInit(): void {
    const savedUser = localStorage.getItem('user');
    console.log('Datos en crudo recuperados:', savedUser);

    if (savedUser && savedUser !== 'undefined') {
      try {
        const parsed = JSON.parse(savedUser);
        this.userProfile = parsed?.data ? parsed.data : parsed;
        console.log('Objeto asignado con éxito:', this.userProfile);

        if (this.userProfile && (this.userProfile._id || parsed._id)) {
          const userId = this.userProfile._id || parsed._id;
          this.cargarMisPublicaciones(userId);
        }
      } catch (error) {
        console.error('Error al parsear el usuario:', error);
      }
    } else {
      console.log('La clave "user" no existe en el localStorage o es undefined.');
    }
  }

  cargarMisPublicaciones(userId: string): void {
    this.pubService.obtenerPublicaciones('fecha', 3, 0, userId).subscribe({
      next: (res) => {
        this.misUltimasPublicaciones = res;
        console.log('Últimas 3 publicaciones cargadas:', this.misUltimasPublicaciones);
      },
      error: (err) => {
        console.error('Error al obtener las publicaciones del perfil:', err);
      }
    });
  }
}