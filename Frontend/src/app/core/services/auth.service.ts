import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/auth';
  private temporizadorSesion: any;

  constructor(private http: HttpClient, private router: Router) {}

  login(credenciales: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credenciales).pipe(
      tap((res: any) => {
        if (res.access_token) {
          localStorage.setItem('token', res.access_token);
          localStorage.setItem('user', JSON.stringify(res.data));
          this.iniciarContadorSesion();
        }
      })
    );
  }

  register(formData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, formData);
  }

  logout(): void {
    this.forzarLogout();
  }

  autorizarToken(): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(`${this.apiUrl}/autorizar`, {}, { headers });
  }

  refrescarToken(): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post('http://localhost:3000/auth/refrescar', {}, { headers });
  }

  iniciarContadorSesion(): void {
    if (this.temporizadorSesion) clearTimeout(this.temporizadorSesion);

    this.temporizadorSesion = setTimeout(() => {
      const extender = confirm('Te quedan 5 minutos de sesión. ¿Deseás extenderla para no perder los cambios?');
      if (extender) {
        this.refrescarToken().subscribe({
          next: (res: any) => {
            if (res.access_token) {
              localStorage.setItem('token', res.access_token);
              this.iniciarContadorSesion(); 
              console.log('Token refrescado con éxito.');
            }
          },
          error: () => this.forzarLogout()
        });
      }
    }, 10 * 60 * 1000); 
  }

  forzarLogout(): void {
    if (this.temporizadorSesion) clearTimeout(this.temporizadorSesion);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }

refrescarSesion(): Observable<any> {
  const user = localStorage.getItem('user');
  const token = user ? JSON.parse(user).access_token : ''; 
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  
  return this.http.post(`${this.apiUrl}/refrescar`, {}, { headers })
    .pipe(
      tap((res: any) => {
        localStorage.setItem('user', JSON.stringify(res)); 
      })
    );
}
}