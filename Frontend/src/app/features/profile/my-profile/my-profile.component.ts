import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

// Interfaz para el tipado estricto
interface User {
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

ngOnInit(): void {
  const savedUser = localStorage.getItem('user');
  console.log('Datos en crudo recuperados:', savedUser);

  // CORREGIDO: Validamos estrictamente que exista y no sea el string "undefined"
  if (savedUser && savedUser !== 'undefined') {
    try {
      const parsed = JSON.parse(savedUser);
      this.userProfile = parsed?.data ? parsed.data : parsed;
      console.log('Objeto asignado con éxito:', this.userProfile);
    } catch (error) {
      console.error('Error al parsear el usuario:', error);
    }
  } else {
    console.log('La clave "user" no existe en el localStorage o es undefined.');
  }
}
}