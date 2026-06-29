import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt'; 

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1];

    if (!token) throw new UnauthorizedException('Token no proporcionado');

    try {
      const payload = this.jwtService.verify(token); 
      request.user = payload; 
      return true;
    } catch (e) {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }
}