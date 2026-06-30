import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const userString = localStorage.getItem('user');
    let token = '';

    if (userString) {
        try {
            const user = JSON.parse(userString);
            token = user.access_token; 
        } catch (e) {
            console.error('Error parseando el usuario:', e);
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
}}