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

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

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

  obtenerUsuarios(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  crearUsuarioAdmin(usuario: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, usuario, { headers: this.getHeaders() });
  }

  deshabilitarUsuario(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  rehabilitarUsuario(id: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/alta/${id}`, {}, { headers: this.getHeaders() });
  }

  darDeBajaAdmin(id: string): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.delete(`http://localhost:3000/publicaciones/admin/baja/${id}`, { headers });
  }

  obtenerStatsPubsPorUsuario(inicio: string, fin: string): Observable<any[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any[]>(`http://localhost:3000/estadisticas/publicaciones-por-usuario?inicio=${inicio}&fin=${fin}`, { headers });
  }

  obtenerStatsComentariosTotales(inicio: string, fin: string): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any>(`http://localhost:3000/estadisticas/comentarios-totales?inicio=${inicio}&fin=${fin}`, { headers });
  }

  obtenerStatsComentariosPorPub(inicio: string, fin: string): Observable<any[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any[]>(`http://localhost:3000/estadisticas/comentarios-por-publicacion?inicio=${inicio}&fin=${fin}`, { headers });
  }
}