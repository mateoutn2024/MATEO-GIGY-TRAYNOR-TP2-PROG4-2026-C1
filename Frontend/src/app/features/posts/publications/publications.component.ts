import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common'; 
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PublicacionesService } from '../../../core/services/publicaciones.service';

@Component({
  selector: 'app-publicaciones',
  standalone: true,                        
  imports: [CommonModule, DatePipe, FormsModule],        
  templateUrl: './publications.component.html',
  styleUrls: ['./publications.component.scss']
})
export class PublicationsComponent implements OnInit { 
  publicaciones: any[] = [];
  orden: 'fecha' | 'likes' = 'fecha';
  limit = 5;
  offset = 0;
  usuarioLogueadoId = ''; 

  nuevoTitulo = '';
  nuevaDescripcion = '';
  imagenFile: File | null = null; 

  constructor(private pubService: PublicacionesService, private router: Router) {}

  ngOnInit(): void {
    const savedUser = localStorage.getItem('user');
    
    if (!savedUser) {
        this.router.navigate(['/login']); 
        return;
      }

    try {
      const parsed = JSON.parse(savedUser);
      const data = parsed?.data ? parsed.data : parsed;
      this.usuarioLogueadoId = (parsed?.data?._id || parsed?._id || '').toString();
      console.log('ID de usuario logueado en publicaciones:', this.usuarioLogueadoId);
    } catch (e) {
      console.error('Error al recuperar id en publicaciones', e);
      this.publicaciones = [];
      return;
    }

    this.cargarPublicaciones();
  }

  cargarPublicaciones(append = false): void {
      this.pubService.obtenerPublicaciones(this.orden, this.limit, this.offset).subscribe({
        next: (res: any) => { 
          let listaFila = res?.data ? res.data : (Array.isArray(res) ? res : []);        
          this.publicaciones = append ? [...this.publicaciones, ...listaFila] : listaFila;
        },
        error: (err: any) => console.error('Error al cargar publicaciones:', err)
      });
    }
    
    onFileSelected(event: any): void {
      const file = event.target.files[0];
      if (file) {
        this.imagenFile = file;
        console.log('Archivo seleccionado listo para Multer:', file.name);
      }
    }

  crearPost(): void {
      if (!this.nuevoTitulo.trim() || !this.nuevaDescripcion.trim()) {
        return; 
      }

      const savedUser = localStorage.getItem('user');
      let miId = '';
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        miId = (parsed?.data?._id || parsed?._id || parsed?.id || '').toString();
      }

      if (!miId) {
        console.error('No se encontró el ID del usuario logueado');
        return;
      }

      const formData = new FormData();
      formData.append('titulo', this.nuevoTitulo);
      formData.append('descripcion', this.nuevaDescripcion);
      formData.append('usuarioId', miId); 

      if (this.imagenFile) {
        formData.append('imagen', this.imagenFile);
      }

      this.pubService.crearPublicacion(formData).subscribe({
        next: () => {
          this.nuevoTitulo = '';
          this.nuevaDescripcion = '';
          this.imagenFile = null;
          this.cargarPublicaciones();
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
    
    const yaTieneLike = pub.likes.some((id: any) => id.toString() === this.usuarioLogueadoId.toString());
    
    if (yaTieneLike) {
      this.pubService.quitarLike(pub._id, this.usuarioLogueadoId).subscribe({
        next: () => {
          pub.likes = pub.likes.filter((id: any) => id.toString() !== this.usuarioLogueadoId.toString());
          console.log('Like removido localmente y en base de datos');
        },
        error: (err: any) => console.error('Error al quitar el like:', err)
      });
    } else {
      console.log('-> Ejecutando camino de DAR LIKE');
      this.pubService.darLike(pub._id, this.usuarioLogueadoId).subscribe({
        next: () => {
          pub.likes.push(this.usuarioLogueadoId);
          console.log('Like agregado localmente y en base de datos');
        },
        error: (err: any) => console.error('Error al dar like:', err)
      });
    }
  }

eliminar(idPublicacion: string): void {
    const confirmar = confirm('¿Estás seguro de que querés eliminar esta publicación de forma definitiva?');
    
    if (confirmar) {
      this.pubService.eliminarPublicacion(idPublicacion).subscribe({
        next: (res) => {
          console.log('Borrado exitoso en Mongo:', res);
          
          this.publicaciones = this.publicaciones.filter(pub => pub._id !== idPublicacion);
        },
        error: (err) => {
          console.error('Error al intentar borrar en MongoDB:', err);
          alert('Hubo un error al intentar eliminar la publicación.');
        }
      });
    }
  }
  esDuenio(creadorId: any): boolean {
    if (!creadorId) return false;

    const idCreador = typeof creadorId === 'string' 
      ? creadorId 
      : (creadorId._id ? creadorId._id.toString() : creadorId.toString());

    const savedUser = localStorage.getItem('user');
    if (!savedUser) return false;
    
    const parsed = JSON.parse(savedUser);
    const miId = (parsed?.data?._id || parsed?._id || parsed?.id || '').toString();

    return idCreador.trim() === miId.trim();
  }

  verDetalle(idPublicacion: string): void {
    this.router.navigate(['/publicaciones', idPublicacion]);
  }
}