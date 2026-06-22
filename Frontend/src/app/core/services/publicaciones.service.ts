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

  crearPublicacion(pub: { titulo: string; descripcion: string; imagenUrl?: string }): Observable<any> {
    return this.http.post<any>(this.apiUrl, pub);
  }

  eliminarPublicacion(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  darLike(id: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/like`, {});
  }

  quitarLike(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}/like`);
  }
}