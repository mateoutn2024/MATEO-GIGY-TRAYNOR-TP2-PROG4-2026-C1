import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common'; 
import { FormsModule } from '@angular/forms';
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

  constructor(private pubService: PublicacionesService) {}

  ngOnInit(): void {
    const savedUser = localStorage.getItem('user');
    
    if (!savedUser || savedUser === 'undefined') {
      console.log('No hay usuario logueado. Vaciando muro...');
      this.publicaciones = [];
      this.usuarioLogueadoId = '';
      return; 
    }

    try {
      const parsed = JSON.parse(savedUser);
      const data = parsed?.data ? parsed.data : parsed;
      this.usuarioLogueadoId = data?._id || parsed?._id || '';
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
        
        // 🌟 INYECCIÓN DE COMENTARIOS HARDCODEADOS EN LAS 3 PRIMERAS PUBLICACIONES
        if (listaFila.length > 0 && !append) {
          // Publicación 1 (La primera del muro)
          if (listaFila[0]) {
            listaFila[0].comentarios = [
              { autor: 'Carlos Mendoza', texto: '¡Buenísimo el posteo! Me sirve un montón para el TP.', fecha: new Date() },
              { autor: 'Laura Gómez', texto: '¿Alguien sabe si esto entra en el parcial de la semana que viene?', fecha: new Date() }
            ];
          }
          // Publicación 2
          if (listaFila[1]) {
            listaFila[1].comentarios = [
              { autor: 'Esteban Quito', texto: 'Totalmente de acuerdo con lo que pusiste ahí.', fecha: new Date() }
            ];
          }
          // Publicación 3
          if (listaFila[2]) {
            listaFila[2].comentarios = [
              { autor: 'Analia Buonanotte', texto: 'Che, qué buena foto. ¿Con qué la sacaste?', fecha: new Date() },
              { autor: 'Marcos Galperín', texto: 'Tremendo proyecto, directo a producción de una.', fecha: new Date() }
            ];
          }
        }
        
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
    if (!this.nuevoTitulo || !this.nuevaDescripcion) {
      alert('Por favor completa el título y la descripción');
      return;
    }

    const formData = new FormData();
    formData.append('titulo', this.nuevoTitulo);
    formData.append('descripcion', this.nuevaDescripcion);
    formData.append('usuarioId', this.usuarioLogueadoId);

    if (this.imagenFile) {
      formData.append('imagen', this.imagenFile);
    }

    this.pubService.crearPublicacion(formData).subscribe({
      next: (res: any) => {
        console.log('Publicación creada con éxito:', res);
        
        this.nuevoTitulo = '';
        this.nuevaDescripcion = '';
        this.imagenFile = null;
        
        const fileInput = document.getElementById('foto-input') as HTMLInputElement;
        if (fileInput) fileInput.value = '';

        this.offset = 0; 
        this.cargarPublicaciones(); 
      },
      error: (err: any) => {
        console.error('ERROR COMPLETO DEL BACKEND:', err);
        alert('Hubo un error al guardar en la base de datos.');
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

  eliminar(id: string): void {
    if (confirm('¿Seguro que querés eliminar esta publicación?')) {
      this.pubService.eliminarPublicacion(`${id}?usuarioId=${this.usuarioLogueadoId}`).subscribe({
        next: () => {
          this.publicaciones = this.publicaciones.filter(p => p._id !== id);
          console.log('Publicación Skull eliminada del muro.');
        },
        error: (err: any) => console.error('Error al eliminar publicación:', err) 
      });
    }
  }

  esDuenio(pubUsuarioId: any): boolean {
    if (!pubUsuarioId || !this.usuarioLogueadoId) return false;
    
    const idPublicacion = pubUsuarioId._id ? pubUsuarioId._id.toString() : pubUsuarioId.toString();
    const idLogueado = this.usuarioLogueadoId.toString();
    
    return idPublicacion === idLogueado;
  }
}