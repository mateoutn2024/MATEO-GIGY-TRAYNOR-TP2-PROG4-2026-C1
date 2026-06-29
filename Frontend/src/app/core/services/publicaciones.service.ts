import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PublicacionesService {
  private apiUrl = 'http://localhost:3000/publicaciones';

  constructor(private http: HttpClient) {}

  obtenerPublicaciones(orden: 'fecha' | 'likes', limit: number, offset: number, usuarioId?: string): Observable<any[]> {
    let url = `${this.apiUrl}?orden=${orden}&limit=${limit}&offset=${offset}`;
    if (usuarioId) url += `&usuarioId=${usuarioId}`;
    return this.http.get<any[]>(url);
  }

  crearPublicacion(formData: FormData): Observable<any> {
      return this.http.post(this.apiUrl, formData);
    }

  eliminarPublicacion(id: string): Observable<any> {
      const token = this.obtenerTokenBlindado();
      
      if (!token) {
        alert('No se encontró el token criptográfico. Por favor, hacé clic en "Salir" arriba a la derecha y volvé a loguearte.');
        return throwError(() => new Error('No hay token disponible'));
      }

      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      return this.http.delete(`${this.apiUrl}/${id}`, { headers });
    }

  darLike(publicacionId: string, usuarioId: string): Observable<any> {
      return this.http.post(`${this.apiUrl}/${publicacionId}/like?usuarioId=${usuarioId}`, {});
    }

  quitarLike(publicacionId: string, usuarioId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${publicacionId}/like?usuarioId=${usuarioId}`);
  }

  obtenerComentariosPaginados(pubId: string, limit: number, offset: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${pubId}/comentarios?limit=${limit}&offset=${offset}`);
  }

  enviarComentario(pubId: string, mensaje: string, usuarioId: string): Observable<any> {
    const token = this.obtenerTokenBlindado();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.post(`${this.apiUrl}/${pubId}/comentarios`, { mensaje, usuarioId }, { headers });
  }

  editarComentario(pubId: string, comentarioId: string, mensaje: string): Observable<any> {
    const token = this.obtenerTokenBlindado();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.put(`${this.apiUrl}/${pubId}/comentarios/${comentarioId}`, { mensaje }, { headers });
  }
  
  private obtenerTokenBlindado(): string | null {
    let token = localStorage.getItem('token');
    if (token && token !== 'null' && token !== 'undefined') return token;

    const userCache = localStorage.getItem('user');
    if (userCache) {
      try {
        const u = JSON.parse(userCache);
        token = u.access_token || u.token || u?.data?.access_token || u?.data?.token;
        
        if (token && typeof token === 'string') {
          localStorage.setItem('token', token); 
          return token;
        }
      } catch (e) {}
    }

    return null;
  }
}