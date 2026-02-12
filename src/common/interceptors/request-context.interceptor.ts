import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { RequestContextService } from '../context/request.context';
import { JwtService } from 'src/modules/auth/jwt/jwt.service';

@Injectable()
export class RequestContextInterceptor implements NestInterceptor {
  constructor(private readonly jwtService: JwtService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    let userId: string | undefined;

    if (token) {
      try {
        const payload = await this.jwtService.verifyToken(token);
        userId = payload?.sub;
      } catch (error) {
        // Token invalid, continue without userId
      }
    }

    return new Observable((observer) => {
      RequestContextService.run({ userId }, () => {
        next.handle().subscribe({
          next: (value) => observer.next(value),
          error: (error) => observer.error(error),
          complete: () => observer.complete(),
        });
      });
    });
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
