import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const userJson = localStorage.getItem('user');
    
    let token = '';
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        token = user.access_token || user.token || '';
      } catch (e) {
        console.error("Error al leer el token del localStorage", e);
      }
    }

    if (token) {
      const clonada = req.clone({
        setHeaders: { 
          Authorization: `Bearer ${token}` 
        }
      });
      return next.handle(clonada);
    }

    return next.handle(req);
  }
}