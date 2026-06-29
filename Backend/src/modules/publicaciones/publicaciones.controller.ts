import { 
  Controller, Get, Post, Delete, Body, Param, Put, Query,Headers, 
  UseGuards, Request, ForbiddenException, HttpCode, HttpStatus,
  UseInterceptors, UploadedFile, BadRequestException 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express'; 
import { diskStorage } from 'multer'; 
import { extname } from 'path';
import { PublicacionesService } from './publicaciones.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('publicaciones')
@UseGuards(AuthGuard)
export class PublicacionesController {
  constructor(private readonly publicacionesService: PublicacionesService) {}

  @Post()
  @UseGuards(AuthGuard)
  @UseInterceptors(
    FileInterceptor('imagen', {
      storage: diskStorage({
        destination: './uploads', 
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `publicacion-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          return callback(new BadRequestException('Solo se permiten imágenes.'), false);
        }
        callback(null, true);
      },
    }),
  )
  async crear(
    @Body() body: { titulo: string; descripcion: string; usuarioId?: string }, 
    @Request() req,
    @UploadedFile() file: Express.Multer.File 
  ) {
    console.log('====== ¡LLEGÓ UNA PETICIÓN POST A CONTROLADOR! ======', body);

    const userId = body.usuarioId || req.user?._id || req.user?.id;

    const imagenUrl = file ? `/uploads/${file.filename}` : '';

    const nuevaPublicacionData = {
      titulo: body.titulo,
      descripcion: body.descripcion,
      imagenUrl: imagenUrl
    };

    return this.publicacionesService.crear(nuevaPublicacionData, userId);
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
  async eliminar(
    @Param('id') id: string, 
    @Headers('authorization') authHeader: string
  ) {
    try {
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new ForbiddenException('No hay token o el formato es incorrecto');
      }

      const token = authHeader.split(' ')[1];
      if (!token || token === 'null' || token === 'undefined') {
        throw new ForbiddenException('El token viaja vacío desde el frontend');
      }

      const partesToken = token.split('.');
      if (partesToken.length !== 3) {
        throw new ForbiddenException('El token provisto no es un JWT válido');
      }

      const payloadBuffer = Buffer.from(partesToken[1], 'base64');
      const payload = JSON.parse(payloadBuffer.toString('utf8'));

      const userId = payload.sub || payload._id || payload.id;
      const userRole = payload.role;

      return await this.publicacionesService.eliminarPublicacion(id, userId, userRole);

    } catch (error) {
          if (error instanceof ForbiddenException) throw error;
          
          const mensajeError = (error as any).message || 'Error desconocido';
          throw new BadRequestException(`NestJS no pudo procesar la eliminación: ${mensajeError}`);
        }
  }

  @Post(':id/like')
  async darLike(
    @Param('id') id: string, 
    @Query('usuarioId') usuarioId: string 
  ) {
    return this.publicacionesService.agregarLike(id, usuarioId);
  }

  @Delete(':id/like')
  async quitarLike(
    @Param('id') pubId: string, 
    @Query('usuarioId') usuarioId: string
  ) {
    console.log('====== PETICIÓN DE QUITAR LIKE ======');
    return this.publicacionesService.removerLike(pubId, usuarioId);
  }

  @Post(':id/comentarios')
  async agregarComentario(
    @Param('id') pubId: string,
    @Body() body: { mensaje: string; usuarioId: string }
  ) {
    return this.publicacionesService.agregarComentario(pubId, body.mensaje, body.usuarioId);
  }

  @Put(':id/comentarios/:comentarioId')
  async modificarComentario(
    @Param('id') pubId: string,
    @Param('comentarioId') comentarioId: string,
    @Body() body: { mensaje: string }
  ) {
    return this.publicacionesService.modificarComentario(pubId, comentarioId, body.mensaje);
  }

  @Get(':id/comentarios')
  async obtenerComentarios(
    @Param('id') pubId: string,
    @Query('limit') limit: string = '5',
    @Query('offset') offset: string = '0'
  ) {
    return this.publicacionesService.obtenerComentariosPaginados(pubId, parseInt(limit, 10), parseInt(offset, 10));
  }


}