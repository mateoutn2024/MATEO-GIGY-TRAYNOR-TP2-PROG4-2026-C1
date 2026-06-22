import { 
  Controller, Get, Post, Delete, Body, Param, Query, 
  UseGuards, Request, ForbiddenException, HttpCode, HttpStatus 
} from '@nestjs/common';
import { PublicacionesService } from './publicaciones.service';
import { AuthGuard } from '../modules/auth/auth.guard';

@Controller('publicaciones')
@UseGuards(AuthGuard)
export class PublicacionesController {
  constructor(private readonly publicacionesService: PublicacionesService) {}

  @Post()
  async crear(@Body() body: { titulo: string; descripcion: string; imagenUrl?: string }, @Request() req) {
    return this.publicacionesService.crear(body, req.user.id);
  }

  @Get()
  async listar(
    @Query('orden') orden: 'fecha' | 'likes' = 'fecha',
    @Query('usuarioId') usuarioId?: string,
    @Query('limit') limit: string = '10',
    @Query('offset') offset: string = '0'
  ) {
    return this.publicacionesService.listar(orden, usuarioId, parseInt(limit, 10), parseInt(offset, 10));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async eliminar(@Param('id') id: string, @Request() req) {
    const esAdmin = req.user.role === 'administrador';
    const esDuenio = await this.publicacionesService.verificarDuenio(id, req.user.id);

    if (!esAdmin && !esDuenio) {
      throw new ForbiddenException('No tienes permisos.');
    }
    return this.publicacionesService.bajaLogica(id);
  }

  @Post(':id/like')
  async darLike(@Param('id') id: string, @Request() req) {
    return this.publicacionesService.agregarLike(id, req.user.id);
  }

  @Delete(':id/like')
  async quitarLike(@Param('id') id: string, @Request() req) {
    return this.publicacionesService.removerLike(id, req.user.id);
  }
}