import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, CommonModule],
  template: `
    <div *ngIf="isLoading" class="loading-overlay">
      <div class="spinner"></div>
      <p class="loading-text">{{ mensajeCarga }}</p>
    </div>

    <app-navbar></app-navbar>
    <main class="main-content">
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    .loading-overlay { 
      position: fixed; top:0; left:0; width:100vw; height:100vh; background:white; 
      display:flex; flex-direction: column; justify-content:center; align-items:center; z-index:99999; 
    }
    .loading-text { margin-top: 15px; color: #333; font-family: sans-serif; font-weight: 500; }
    .spinner { border: 4px solid #f3f3f3; border-top: 4px solid #0056b3; border-radius: 50%; width: 40px; height: 40px; animation: spin 0.8s linear infinite; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    .hidden { display: none; }
  `]
})

export class AppComponent implements OnInit {
  isLoading = true; 
  mensajeCarga = "Inicializando aplicación...";

  constructor(private router: Router) {}

  ngOnInit() {
    setTimeout(() => {
      this.isLoading = false; 
    }, 2000); 
  }
}