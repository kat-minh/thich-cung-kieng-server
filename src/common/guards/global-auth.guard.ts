import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { Request } from 'express';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { JwtService } from 'src/modules/auth/jwt/jwt.service';

@Injectable()
export class GlobalAuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const checkDecorators = this.injectDecorator(context);
    if (checkDecorators.isPublic) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Không tìm thấy token xác thực');
    }

    try {
      // Xác thực token bằng JwtService tùy chỉnh
      const payload = await this.jwtService.verifyToken(token);

      // Gán thông tin người dùng vào request
      request['user'] = {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
      };

      if (
        checkDecorators.requiredRoles &&
        !checkDecorators.requiredRoles.includes(request['user'].role)
      ) {
        throw new ForbiddenException('Không đủ quyền truy cập');
      }

      return true;
    } catch (error) {
      throw new UnauthorizedException(
        error instanceof Error ? error.message : 'Unauthorized',
      );
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private injectDecorator(context: ExecutionContext): any {
    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Get required roles for the route
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    return {
      isPublic,
      requiredRoles,
    };
  }
}
