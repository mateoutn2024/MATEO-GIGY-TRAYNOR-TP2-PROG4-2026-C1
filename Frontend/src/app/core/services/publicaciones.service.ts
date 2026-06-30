import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
      return this.http.delete(`${this.apiUrl}/${id}`);
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
    return this.http.post(`${this.apiUrl}/${pubId}/comentarios`, { mensaje, usuarioId });
  }

  editarComentario(pubId: string, comentarioId: string, mensaje: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${pubId}/comentarios/${comentarioId}`, { mensaje });
  }

  obtenerUsuarios(): Observable<any[]> {
    return this.http.get<any[]>('http://localhost:3000/usuarios');
  }

  crearUsuarioAdmin(usuario: any): Observable<any> {
    return this.http.post<any>('http://localhost:3000/usuarios', usuario);
  }

  deshabilitarUsuario(id: string): Observable<any> {
    return this.http.delete<any>(`http://localhost:3000/usuarios/${id}`);
  }

  rehabilitarUsuario(id: string): Observable<any> {
    return this.http.post<any>(`http://localhost:3000/usuarios/alta/${id}`, {});
  }

  darDeBajaAdmin(id: string): Observable<any> {
    return this.http.delete(`http://localhost:3000/publicaciones/admin/baja/${id}`);
  }

  obtenerStatsPubsPorUsuario(inicio: string, fin: string): Observable<any[]> {
    return this.http.get<any[]>(`http://localhost:3000/estadisticas/publicaciones-por-usuario?inicio=${inicio}&fin=${fin}`);
  }

  obtenerStatsComentariosTotales(inicio: string, fin: string): Observable<any> {
    return this.http.get<any>(`http://localhost:3000/estadisticas/comentarios-totales?inicio=${inicio}&fin=${fin}`);
  }

  obtenerStatsComentariosPorPub(inicio: string, fin: string): Observable<any[]> {
    return this.http.get<any[]>(`http://localhost:3000/estadisticas/comentarios-por-publicacion?inicio=${inicio}&fin=${fin}`);
  }
}