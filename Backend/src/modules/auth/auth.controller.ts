import { Controller, Post, Body, UseInterceptors, UploadedFile, HttpCode, HttpStatus, Headers, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './uploads/avatars',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async registrar(@Body() registerDto: RegisterDto, @UploadedFile() file: Express.Multer.File) {
    return this.authService.registrar(registerDto, file);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('autorizar')
  @HttpCode(HttpStatus.OK)
  async autorizar(@Headers('authorization') authHeader: string) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token no provisto o formato inválido');
    }
    const token = authHeader.split(' ')[1];
    return this.authService.validarYAutorizarToken(token);
  }

  @Post('refrescar')
  @HttpCode(HttpStatus.OK)
  async refrescar(@Headers('authorization') authHeader: string) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token no provisto o formato inválido');
    }
    const token = authHeader.split(' ')[1];
    return this.authService.refrescarToken(token);
  }
}