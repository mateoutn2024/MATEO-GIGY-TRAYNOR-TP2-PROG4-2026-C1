import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common'; 
import { PublicacionesService } from '../../../core/services/publicaciones.service';

@Component({
  selector: 'app-publicaciones',
  standalone: true,                        
  imports: [CommonModule, DatePipe],        
  templateUrl: './publications.component.html',
  styleUrls: ['./publications.component.scss']
})
export class PublicationsComponent implements OnInit { 
  publicaciones: any[] = [];
  orden: 'fecha' | 'likes' = 'fecha';
  limit = 5;
  offset = 0;
  usuarioLogueadoId = ''; 

  constructor(private pubService: PublicacionesService) {}

  ngOnInit(): void {
    const savedUser = localStorage.getItem('user');
    if (savedUser && savedUser !== 'undefined') {
      try {
        const parsed = JSON.parse(savedUser);
        const data = parsed?.data ? parsed.data : parsed;
        this.usuarioLogueadoId = data?._id || parsed?._id || '';
        console.log('ID de usuario logueado en publicaciones:', this.usuarioLogueadoId);
      } catch (e) {
        console.error('Error al recuperar id en publicaciones', e);
      }
    }

    this.cargarPublicaciones();
  }

  cargarPublicaciones(append = false): void {
    this.pubService.obtenerPublicaciones(this.orden, this.limit, this.offset).subscribe({
      next: (res: any[]) => { // Tipado estricto res: any[] añadido
        this.publicaciones = append ? [...this.publicaciones, ...res] : res;
      },
      error: (err: any) => console.error('Error al cargar publicaciones:', err) 
    });
  }

  crearPost(titulo: string, descripcion: string, imagenUrl: string): void {
    if (!titulo || !descripcion) {
      alert('Por favor completa el título y la descripción');
      return;
    }

    const nuevaPub = { titulo, descripcion, imagenUrl: imagenUrl || undefined };

    this.pubService.crearPublicacion(nuevaPub).subscribe({
      next: (res: any) => {
        console.log('Publicación creada con éxito:', res);
        this.offset = 0; 
        this.cargarPublicaciones(); 
      },
      error: (err: any) => {
        console.error('Error al crear la publicación:', err);
        alert('Hubo un error al guardar en la base de datos. ¿Tenés el backend prendido?');
      }
    });
  }

  cambiarOrden(nuevoOrden: 'fecha' | 'likes'): void {
    this.orden = nuevoOrden;
    this.offset = 0;
    this.cargarPublicaciones();
  }

  cargarMas(): void {
    this.offset += this.limit;
    this.cargarPublicaciones(true);
  }

  manejarLike(pub: any): void {
    if (!this.usuarioLogueadoId) return;
    
    const yaTieneLike = pub.likes.includes(this.usuarioLogueadoId);
    if (yaTieneLike) {
      this.pubService.quitarLike(pub._id).subscribe({
        next: () => {
          pub.likes = pub.likes.filter((id: string) => id !== this.usuarioLogueadoId);
        }
      });
    } else {
      this.pubService.darLike(pub._id).subscribe({
        next: () => {
          pub.likes.push(this.usuarioLogueadoId);
        }
      });
    }
  }

  eliminar(id: string): void {
    if (confirm('¿Seguro que querés eliminar esta publicación?')) {
      this.pubService.eliminarPublicacion(id).subscribe({
        next: () => {
          this.publicaciones = this.publicaciones.filter(p => p._id !== id);
        },
        error: (err: any) => console.error('Error al eliminar publicación:', err) // Tipado estricto err: any añadido
      });
    }
  }
}