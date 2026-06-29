import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user; 

    if (!user || user.role !== 'administrador') {
      throw new ForbiddenException('Acceso denegado: Se requiere perfil de Administrador');
    }

    return true;
  }
}