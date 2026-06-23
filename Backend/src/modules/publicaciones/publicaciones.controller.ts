import { 
  Controller, Get, Post, Delete, Body, Param, Query, 
  UseGuards, Request, ForbiddenException, HttpCode, HttpStatus 
} from '@nestjs/common';
import { PublicacionesService } from './publicaciones.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('publicaciones')
@UseGuards(AuthGuard)
export class PublicacionesController {
  constructor(private readonly publicacionesService: PublicacionesService) {}

  @Post()
  @UseGuards(AuthGuard)
  async crear(@Body() body: { titulo: string; descripcion: string; imagenUrl?: string; usuarioId?: string }, @Request() req) {
    console.log('====== ¡LLEGÓ UNA PETICIÓN POST A CONTROLADOR! ======', body);

    const userId = body.usuarioId || req.user?._id || req.user?.id;

    return this.publicacionesService.crear(body, userId);
  }

  @Get()
  @UseGuards(AuthGuard)
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
    async eliminar(
      @Param('id') id: string, 
      @Query('usuarioId') usuarioId: string, 
      @Request() req
    ) {
      const userIdLogueado = usuarioId || req.user?._id || req.user?.id;
      
      const esDuenio = await this.publicacionesService.verificarDuenio(id, userIdLogueado);

      if (!esDuenio) {
        throw new ForbiddenException('No tienes permisos.');
      }
      
      return this.publicacionesService.bajaLogica(id);
    } 

  @Post(':id/like')
  async darLike(@Param('id') id: string, @Request() req) {
    const userId = req.user?._id || req.user?.id;
    return this.publicacionesService.agregarLike(id, userId);
  }

  @Delete(':id/like')
  async quitarLike(@Param('id') id: string, @Request() req) {
    const userId = req.user?._id || req.user?.id;
    return this.publicacionesService.removerLike(id, userId);
  }
}