import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  esAdmin: boolean = false;

  constructor(public authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        const rol = u.role || u.data?.role;
        this.esAdmin = (rol === 'administrador');
      } catch(e) { 
        this.esAdmin = false; 
      }
    }
  } 

  logout(): void {
    this.authService.logout();

    localStorage.removeItem('user');
    localStorage.clear();
    sessionStorage.clear();

    this.router.navigate(['/login']).then(() => {
      window.location.reload();
    });
  }
}