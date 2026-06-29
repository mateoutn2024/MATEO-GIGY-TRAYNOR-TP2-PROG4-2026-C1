import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuariosService } from '../../../core/services/usuarios.service';
@Component({
  selector: 'app-dashboard-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard-usuarios.component.html',
  styleUrls: ['./dashboard-usuarios.component.scss']
})
export class DashboardUsuariosComponent implements OnInit {
  usuarios: any[] = [];
  
  nuevoUsuario = {
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    birthDate: '',
    description: '',
    avatarUrl: '/uploads/avatars/default.png',
    role: 'usuario'
  };

  constructor(private usuariosService: UsuariosService) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

    cargarUsuarios(): void {
    this.usuariosService.obtenerUsuarios().subscribe({
        next: (res: any) => {
        this.usuarios = Array.isArray(res) ? res : (res?.data || []);
        
        console.log('-> USUARIOS DESEMPAQUETADOS EN ANGULAR:', this.usuarios);
        },
        error: (err: any) => console.error('Error al cargar usuarios:', err)
    });
    }

  registrarUsuario(): void {
    if (!this.nuevoUsuario.email || !this.nuevoUsuario.password || !this.nuevoUsuario.username) {
      alert('Completá los campos obligatorios');
      return;
    }

    this.usuariosService.crearUsuarioAdmin(this.nuevoUsuario).subscribe({
      next: () => {
        alert('Usuario creado con éxito');
        this.cargarUsuarios();
        this.resetFormulario();
      },
      error: (err: any) => {
        console.error(err);
        alert('Error al crear usuario. Verificá que el correo o usuario no existan ya.');
      }
    });
  }

  cambiarEstado(user: any): void {
    if (user.activo) {
      if (confirm(`¿Deshabilitar a ${user.username}? No podrá iniciar sesión.`)) {
        this.usuariosService.deshabilitarUsuario(user._id).subscribe(() => this.cargarUsuarios());
      }
    } else {
      this.usuariosService.rehabilitarUsuario(user._id).subscribe(() => this.cargarUsuarios());
    }
  }

  resetFormulario(): void {
    this.nuevoUsuario = {
      firstName: '',
      lastName: '',
      email: '',
      username: '',
      password: '',
      birthDate: '',
      description: '',
      avatarUrl: '/uploads/avatars/default.png',
      role: 'usuario'
    };
  }
}