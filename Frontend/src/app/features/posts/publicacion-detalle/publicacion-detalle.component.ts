import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PublicacionesService } from '../../../core/services/publicaciones.service';

@Component({
  selector: 'app-publicacion-detalle',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './publicacion-detalle.component.html',
  styleUrls: ['./publicacion-detalle.component.scss']
})
export class PublicacionDetalleComponent implements OnInit {
  publicacion: any = null;
  comentarios: any[] = [];
  nuevoComentario = '';
  
  limit = 5;
  offset = 0;
  bloquearCargarMas = false;
  
  usuarioLogueadoId: string = '';
  comentarioEditandoId: string | null = null;
  mensajeEditado: string = '';

  constructor(
    private route: ActivatedRoute, 
    private router: Router,
    private pubService: PublicacionesService
  ) {}

  ngOnInit(): void {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      this.usuarioLogueadoId = parsed._id || parsed.data?._id || '';
    }
    
    const idPublicacion = this.route.snapshot.paramMap.get('id');
    if (idPublicacion) {
      this.cargarPublicacionBase(idPublicacion);
      this.cargarComentariosMuro(idPublicacion, false);
    }
  }

  cargarPublicacionBase(id: string): void {
    this.pubService.obtenerPublicaciones('fecha', 50, 0).subscribe((res: any) => {
      const lista = res?.data ? res.data : res;
      this.publicacion = lista.find((p: any) => p._id === id);
    });
  }

  cargarComentariosMuro(id: string, append: boolean): void {
    this.pubService.obtenerComentariosPaginados(id, this.limit, this.offset).subscribe((res: any) => {
      
      const comentariosRecibidos = res.data ? (res.data.comentarios || res.data) : (res.comentarios || res);

      const nuevosComentarios = Array.isArray(comentariosRecibidos) ? comentariosRecibidos : [];
      
      if (nuevosComentarios.length < this.limit) {
        this.bloquearCargarMas = true;
      }
      
      this.comentarios = append ? [...this.comentarios, ...nuevosComentarios] : nuevosComentarios;
      console.log("Array final de comentarios corregido:", this.comentarios);
    });
  }
  cargarMas(): void {
    this.offset += this.limit;
    this.cargarComentariosMuro(this.publicacion._id, true);
  }

  agregarComentario(): void {
      if (!this.nuevoComentario.trim()) return;

      const savedUser = localStorage.getItem('user');
      const userId = savedUser ? JSON.parse(savedUser)._id : null;

      this.pubService.enviarComentario(this.publicacion._id, this.nuevoComentario, userId).subscribe({
        next: (res: any) => {
          console.log('Respuesta del servidor al comentar:', res);

          if (res && res.comentarios && Array.isArray(res.comentarios)) {
            const ultimo = res.comentarios[res.comentarios.length - 1];
            this.comentarios.unshift(ultimo);
          } 
          else if (res && res.mensaje) {
            this.comentarios.unshift(res);
          }

          this.nuevoComentario = '';
        },
        error: (err) => {
          console.error('Error al comentar:', err);
          alert('No se pudo guardar el comentario');
        }
      });
    }

  activarModoEdicion(com: any): void {
    this.comentarioEditandoId = com._id;
    this.mensajeEditado = com.mensaje;
    console.log("Modo edición activado para:", this.comentarioEditandoId);
  }

  guardarComentarioEditado(comentarioId: string): void {
    if (!this.mensajeEditado.trim()) return;

    this.pubService.editarComentario(this.publicacion._id, comentarioId, this.mensajeEditado)
      .subscribe({
        next: (res) => {
          const index = this.comentarios.findIndex(c => c._id === comentarioId);
          if (index !== -1) {
            this.comentarios[index].mensaje = this.mensajeEditado;
            this.comentarios[index].modificado = true;
          }
          
          this.comentarioEditandoId = null;
          this.mensajeEditado = '';
        },
        error: (err) => console.error("Error al editar:", err)
      });
  }

  volver(): void {
    this.comentarioEditandoId = null;
    this.router.navigateByUrl('/publicaciones');
  }
}