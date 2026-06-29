import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['../login/login.component.scss']
})
export class RegisterComponent {
  registerForm: FormGroup;
  selectedFile: File | null = null;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^\S.*$/),Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/)]],
      lastName: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^\S.*$/),Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/)]],
      
      email: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)]],
      
      username: ['', [Validators.required, Validators.minLength(3), Validators.pattern(/^\S*$/)]],
      
      password: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[A-Z])(?=.*\d).+$/)]],
      confirmPassword: ['', [Validators.required]],
      
      birthDate: ['', [Validators.required, this.birthDateValidator]], 
      
      description: ['', [Validators.required, Validators.minLength(10), Validators.pattern(/^\S.*$/)]],
      role: ['usuario', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  birthDateValidator(control: AbstractControl) {
    if (!control.value) return null;

    const fechaSeleccionada = new Date(control.value);
    const hoy = new Date();

    if (fechaSeleccionada > hoy) {
      return { fechaFutura: true };
    }

    let edad = hoy.getFullYear() - fechaSeleccionada.getFullYear();
    const mes = hoy.getMonth() - fechaSeleccionada.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaSeleccionada.getDate())) {
      edad--;
    }

    if (edad < 18) {
      return { menorDeEdad: true };
    }

    if (edad > 120) {
      return { fechaInvalida: true };
    }

    return null;
  }

  onFileChange(event: any): void {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }

onSubmit(): void {
    if (this.registerForm.invalid || !this.selectedFile) {
      this.registerForm.markAllAsTouched();
      if (!this.selectedFile) {
         this.errorMessage = 'La imagen de perfil es totalmente obligatoria.';
      }
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    const formData = new FormData();
    Object.keys(this.registerForm.value).forEach(key => {
      formData.append(key, this.registerForm.value[key]);
    });
    formData.append('avatar', this.selectedFile);

    const emailReg = this.registerForm.value.email;
    const passwordReg = this.registerForm.value.password;

    this.authService.register(formData).subscribe({
      next: (res: any) => {
        this.successMessage = '¡Cuenta creada! Sincronizando credenciales...';

        setTimeout(() => {
          this.authService.login({ 
            identifier: emailReg, 
            password: passwordReg 
          }).subscribe({
            next: (loginRes: any) => {
              localStorage.setItem('user', JSON.stringify(loginRes));

              if (loginRes?.token) {
                localStorage.setItem('token', loginRes.token);
              }

              console.log('Login automático exitoso.');
              
              window.location.href = '/publications';
            },
            error: (loginErr: any) => {
              console.error('El backend rechazó el login automático:', loginErr);
              this.errorMessage = 'Usuario creado, pero falló el inicio automático. Por favor inicia sesión manualmente.';
              setTimeout(() => {
                window.location.href = '/login';
              }, 2000);
            }
          });
        }, 500);
      },
      error: (err: any) => {
        this.errorMessage = err.error?.error || 'Ocurrió un error al procesar el registro.';
      }
    });
  } 
}