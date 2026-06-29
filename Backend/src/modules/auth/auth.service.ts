import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService
  ) {}

  async registrar(registerDto: RegisterDto, avatarFile: Express.Multer.File) {
    if (!avatarFile) {
      throw new BadRequestException('La imagen de perfil es obligatoria');
    }

    const existingUser = await this.usersService.findByEmailOrUsername(registerDto.email);
    const existingUsername = await this.usersService.findByEmailOrUsername(registerDto.username);

    if (existingUser || existingUsername) {
      throw new BadRequestException('El correo o el nombre de usuario ya se encuentra registrado');
    }

    const hashedWithPassword = await bcrypt.hash(registerDto.password, 10);
    const avatarUrl = `/uploads/avatars/${avatarFile.filename}`;

    const created = await this.usersService.create({
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      email: registerDto.email,
      username: registerDto.username,
      password: hashedWithPassword,
      birthDate: registerDto.birthDate,
      description: registerDto.description,
      avatarUrl: avatarUrl,
      role: registerDto.role || 'usuario'
    });

    const userObj = created.toObject();
    delete (userObj as any).password;
    return userObj;
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmailOrUsername(loginDto.identifier);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isMatch = await bcrypt.compare(loginDto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const userObj = user.toObject();
    delete (userObj as any).password;

    const payload = { 
      sub: userObj._id,
      email: userObj.email,
      username: userObj.username,
      role: userObj.role || 'usuario' 
    };

    const token = this.jwtService.sign(payload, { expiresIn: '15m' });

    return {
      statusCode: 200,
      data: userObj,
      access_token: token
    };
  }

  async validarYAutorizarToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.usersService.findByEmailOrUsername(payload.email);
      if (!user) throw new UnauthorizedException('Usuario no encontrado');

      const userObj = user.toObject();
      delete (userObj as any).password;

      return { valido: true, data: userObj };
    } catch (error) {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }

  async refrescarToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      
      const nuevaPayload = { 
        sub: payload.sub, 
        email: payload.email, 
        username: payload.username, 
        role: payload.role 
      };

      const nuevoToken = this.jwtService.sign(nuevaPayload, { expiresIn: '15m' });
      return { access_token: nuevoToken };
    } catch (error) {
      throw new UnauthorizedException('No se pudo refrescar el token, vuelva a iniciar sesión');
    }
  }
}