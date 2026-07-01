import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { SessionService } from '../../../core/services/session.service';
import { AutofocusInputDirective } from '../../../shared/directives/autofocus-input.directive';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, AutofocusInputDirective],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private sessionService: SessionService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      identifier: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  onSubmit(): void {
      if (this.loginForm.valid) {
        this.authService.login(this.loginForm.value).subscribe({
          next: (response: any) => {
            console.log('Respuesta del Backend en el login:', response);

            if (response.access_token) {
              localStorage.setItem('token', response.access_token);
            }

            const usuarioReal = response.data ? response.data : response;
            localStorage.setItem('user', JSON.stringify(usuarioReal));

            this.sessionService.iniciarContadorSesion();
            this.router.navigate(['/publicaciones']);
          },
          error: (err: any) => {
            const status = err.status;
            const msgBackend = err.error?.message || err.error || '';

            if (status === 401 || JSON.stringify(msgBackend).toLowerCase().includes('inactiv')) {
              this.errorMessage = '⚠️ Tu cuenta se encuentra inhabilitada. Contactá a un Administrador.';
            } else {
              this.errorMessage = typeof msgBackend === 'string' ? msgBackend : 'Credenciales inválidas';
            }

            console.error('Login rechazado:', this.errorMessage);
          }
        });
      }
    }
}