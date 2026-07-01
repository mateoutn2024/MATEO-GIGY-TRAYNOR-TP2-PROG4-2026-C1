import { Controller, Get, Post, Delete, Param, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';
import { AdminGuard } from '../auth/admin.guard'; 
import { AuthGuard } from '../auth/auth.guard';
import { UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('usuarios')
@UseGuards(AuthGuard, AdminGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async obtenerListado() {
    return this.usersService.listarTodos();
  }


  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('avatar')) 
  async crearUsuarioAdmin(
    @Body() body: any, 
    @UploadedFile() file: Express.Multer.File
  ) {
    
    if (file) {
      body.avatarUrl = `/uploads/avatars/${file.filename}`; 
    } else {
      body.avatarUrl = '/uploads/avatars/default.png'; 
    }

    console.log('-> DATOS RECIBIDOS EN EL BACKEND:', body);
    return this.usersService.crearDesdeAdmin(body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deshabilitar(@Param('id') id: string) {
    return this.usersService.cambiarEstado(id, false);
  }

  @Post('alta/:id')
  @HttpCode(HttpStatus.OK)
  async rehabilitar(@Param('id') id: string) {
    return this.usersService.cambiarEstado(id, true);
  }

}