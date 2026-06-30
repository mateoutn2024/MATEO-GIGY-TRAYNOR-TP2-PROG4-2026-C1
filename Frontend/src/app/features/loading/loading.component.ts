import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="loading-screen">
      <div class="spinner"></div>
      <p>Iniciando aplicación...</p>
    </div>
  `,
  styles: [`
    .loading-screen {
      position: fixed;
      top: 0; left: 0;
      width: 100vw; height: 100vh;
      background-color: #ffffff; /* ¡Blanco opaco! */
      z-index: 99999;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .spinner {
      border: 4px solid #f3f3f3;
      border-top: 4px solid #0056b3;
      border-radius: 50%;
      width: 40px; height: 40px;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  `]
})
export class LoadingComponent implements OnInit {
  constructor(private authService: AuthService, private router: Router) {}

ngOnInit(): void {
  setTimeout(() => {
    const userString = localStorage.getItem('user');
    let token = null;

    if (userString) {
      try {
        token = JSON.parse(userString).access_token;
      } catch (e) {}
    }

    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    this.authService.autorizarToken().subscribe({
      next: () => {
        this.router.navigate(['/publicaciones']);
      },
      error: () => {
        localStorage.removeItem('user');
        this.router.navigate(['/login']);
      }
    });
  }, 1200); 
}
}