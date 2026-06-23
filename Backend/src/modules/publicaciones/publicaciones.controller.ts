import { 
  Controller, Get, Post, Delete, Body, Param, Query, 
  UseGuards, Request, ForbiddenException, HttpCode, HttpStatus,
  UseInterceptors, UploadedFile, BadRequestException // 🌟 Agregados para Multer
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express'; // 🌟 Interceptor nativo
import { diskStorage } from 'multer'; // 🌟 Configurador de disco
import { extname } from 'path'; // 🌟 Para manejar las extensiones (.png, .jpg)
import { PublicacionesService } from './publicaciones.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('publicaciones')
@UseGuards(AuthGuard)
export class PublicacionesController {
  constructor(private readonly publicacionesService: PublicacionesService) {}

  @Post()
  @UseGuards(AuthGuard)
  // 🌟 Interceptamos el campo 'imagen' que viene desde el FormData de Angular
  @UseInterceptors(
    FileInterceptor('imagen', {
      storage: diskStorage({
        destination: './uploads', // Carpeta raíz donde se guardarán las fotos
        filename: (req, file, callback) => {
          // Generamos un nombre único usando la fecha para que no se pisen archivos
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `publicacion-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        // Validamos que sea una imagen válida
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
    @UploadedFile() file: Express.Multer.File // 🌟 Multer nos inyecta el archivo acá si existe
  ) {
    console.log('====== ¡LLEGÓ UNA PETICIÓN POST A CONTROLADOR! ======', body);

    const userId = body.usuarioId || req.user?._id || req.user?.id;

    // Si subió archivo, armamos la URL pública; si no, queda vacío
    const imagenUrl = file ? `/uploads/${file.filename}` : '';

    // Armamos el objeto final combinando los textos con la nueva URL de la imagen
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
}