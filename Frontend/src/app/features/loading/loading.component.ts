import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="loading-screen" style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background: #ffffff; font-family: sans-serif;">
      <div class="spinner" style="border: 4px solid rgba(0, 0, 0, 0.1); width: 45px; height: 45px; border-radius: 50%; border-left-color: #0056b3; animation: spin 0.8s linear infinite;"></div>
      <p style="margin-top: 15px; color: #666; font-size: 14px; font-weight: 500;">Iniciando aplicación...</p>
    </div>
    <style>
      @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    </style>
  `
})
export class LoadingComponent implements OnInit {
  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    this.authService.autorizarToken().subscribe({
      next: (res) => {
        if (res.valido) {
          this.authService.iniciarContadorSesion();
          this.router.navigate(['/publicaciones']); 
        } else {
          this.router.navigate(['/login']);
        }
      },
      error: () => {
        this.router.navigate(['/login']); 
      }
    });
  }
}