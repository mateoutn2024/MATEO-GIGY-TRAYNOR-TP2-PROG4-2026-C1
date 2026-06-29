import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PublicacionesService } from '../../../core/services/publicaciones.service';
import { CensurarPalabrasPipe } from '../../../shared/pipes/censurar-palabras.pipe';
import { AutofocusInputDirective } from '../../../shared/directives/autofocus-input.directive';

@Component({
  selector: 'app-publicacion-detalle',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, CensurarPalabrasPipe, AutofocusInputDirective],
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
  esAdmin: boolean = false;
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
      const rol = parsed.role || parsed.data?.role;
      this.esAdmin = (rol === 'administrador');
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
      next: () => {
        this.offset = 0;
        this.cargarComentariosMuro(this.publicacion._id, false);
        this.nuevoComentario = '';
      },
      error: (err: any) => {
        console.error('Error al comentar:', err);
        alert('No se pudo guardar el comentario');
      }
    });
  }

  darDeBajaPublicacionAdmin(): void {
    if (confirm('⚠️ ¿Estás seguro de dar de baja esta publicación? Dejará de estar disponible para todos los usuarios.')) {
      this.pubService.darDeBajaAdmin(this.publicacion._id).subscribe({
        next: () => {
          alert('Publicación dada de baja exitosamente.');
          this.router.navigate(['/publicaciones']);
        },
        error: (err: any) => {
          console.error('Error al dar de baja:', err);
          alert('No se pudo dar de baja la publicación.');
        }
      });
    }
  }

  activarModoEdicion(com: any): void {
    this.comentarioEditandoId = com._id;
    this.mensajeEditado = com.mensaje;
  }

  guardarComentarioEditado(comentarioId: string): void {
    if (!this.mensajeEditado.trim()) return;

    this.pubService.editarComentario(this.publicacion._id, comentarioId, this.mensajeEditado)
      .subscribe({
        next: () => {
          const index = this.comentarios.findIndex(c => c._id === comentarioId);
          if (index !== -1) {
            this.comentarios[index].mensaje = this.mensajeEditado;
            this.comentarios[index].modificado = true;
          }
          this.comentarioEditandoId = null;
          this.mensajeEditado = '';
        },
        error: (err: any) => console.error("Error al editar:", err)
      });
  }

  volver(): void {
    this.comentarioEditandoId = null;
    this.router.navigateByUrl('/publicaciones');
  }
}