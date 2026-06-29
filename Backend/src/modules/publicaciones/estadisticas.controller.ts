import { Controller, Get, Query, UseGuards, HttpCode, HttpStatus, BadRequestException } from '@nestjs/common';
import { PublicacionesService } from './publicaciones.service';
import { AuthGuard } from '../auth/auth.guard';
import { AdminGuard } from '../auth/admin.guard';

@Controller('estadisticas')
@UseGuards(AuthGuard, AdminGuard)
export class EstadisticasController {
  constructor(private readonly publicacionesService: PublicacionesService) {}

  @Get('publicaciones-por-usuario')
  @HttpCode(HttpStatus.OK)
  async publicacionesPorUsuario(
    @Query('inicio') inicio: string,
    @Query('fin') fin: string
  ) {
    this.validarFechas(inicio, fin);
    return this.publicacionesService.estadisticasPublicacionesPorUsuario(inicio, fin);
  }

  @Get('comentarios-totales')
  @HttpCode(HttpStatus.OK)
  async comentariosTotales(
    @Query('inicio') inicio: string,
    @Query('fin') fin: string
  ) {
    this.validarFechas(inicio, fin);
    return this.publicacionesService.estadisticasComentariosTotales(inicio, fin);
  }

  @Get('comentarios-por-publicacion')
  @HttpCode(HttpStatus.OK)
  async comentariosPorPublicacion(
    @Query('inicio') inicio: string,
    @Query('fin') fin: string
  ) {
    this.validarFechas(inicio, fin);
    return this.publicacionesService.estadisticasComentariosPorPublicacion(inicio, fin);
  }

  private validarFechas(inicio: string, fin: string) {
    if (!inicio || !fin || isNaN(new Date(inicio).getTime()) || isNaN(new Date(fin).getTime())) {
      throw new BadRequestException('Las fechas de inicio y fin son obligatorias y deben ser válidas');
    }
  }
}