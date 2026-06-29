import { Component, OnInit } from '@angular/core';
import { SessionService } from './core/services/session.service';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  template: `
    <app-navbar></app-navbar>
    <main class="main-content">
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    .main-content {
      min-height: calc(100vh - 70px);
      background-color: #f8fafc;
      padding: 2rem 0;
    }
  `]
})
export class AppComponent implements OnInit {
  constructor(private sessionService: SessionService, private authService: AuthService) {}

  ngOnInit() {
    if (localStorage.getItem('user')) {
      this.sessionService.iniciarContadorSesion();
    }
  }
}