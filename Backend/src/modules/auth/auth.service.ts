import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async register(registerDto: RegisterDto, avatarFile: Express.Multer.File) {
    if (!avatarFile) {
      throw new BadRequestException('La imagen de perfil es obligatoria');
    }

    const existingUser = await this.usersService.findByEmailOrUsername(registerDto.email);
    const existingUsername = await this.usersService.findByEmailOrUsername(registerDto.username);
    
    if (existingUser || existingUsername) {
      throw new BadRequestException('El correo o el nombre de usuario ya se encuentra registrado');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const avatarUrl = `/uploads/${avatarFile.filename}`;

    const created = await this.usersService.create({
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      email: registerDto.email,
      username: registerDto.username,
      password: hashedPassword,
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
    return userObj;
  }
}