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
    confirmPassword: '',
    birthDate: '',
    description: '',
    role: 'usuario'
  };

  selectedFile: File | null = null;

  constructor(private usuariosService: UsuariosService) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.usuariosService.obtenerUsuarios().subscribe({
      next: (res: any) => {
        this.usuarios = Array.isArray(res) ? res : (res?.data || []);
      },
      error: (err: any) => console.error('Error al cargar usuarios:', err)
    });
  }

  onFileSelected(event: any): void {
    if (event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }

  registrarUsuario(userForm: any): void {
    if (userForm.invalid || this.nuevoUsuario.password !== this.nuevoUsuario.confirmPassword) {
    alert('Por favor, revisá que los campos sean correctos y las contraseñas coincidan.');
    return;
  }
    if (!this.nuevoUsuario.email || !this.nuevoUsuario.password || !this.nuevoUsuario.username) {
      alert('Completá los campos obligatorios');
      return;
    }

    if (this.nuevoUsuario.password !== this.nuevoUsuario.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    const formData = new FormData();
    formData.append('firstName', this.nuevoUsuario.firstName);
    formData.append('lastName', this.nuevoUsuario.lastName);
    formData.append('email', this.nuevoUsuario.email);
    formData.append('username', this.nuevoUsuario.username);
    formData.append('password', this.nuevoUsuario.password);
    formData.append('birthDate', this.nuevoUsuario.birthDate);
    formData.append('description', this.nuevoUsuario.description);
    formData.append('role', this.nuevoUsuario.role);
    
    if (this.selectedFile) {
      formData.append('avatar', this.selectedFile);
    }

    this.usuariosService.crearUsuarioAdmin(formData).subscribe({
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
      confirmPassword: '',
      birthDate: '',
      description: '',
      role: 'usuario'
    };
    this.selectedFile = null;
  }
}