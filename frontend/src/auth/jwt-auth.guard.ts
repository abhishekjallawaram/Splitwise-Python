// auth.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('Invalid auth token');
    }
    const isTokenInvalid = await this.prisma.blacklistedToken.findUnique({
      where: { token },
    });
    if (isTokenInvalid) {
      throw new UnauthorizedException('Invalid Token');
    }
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: 'JHwihegrf38jk-0=2349,wdmf',
      });

      // Get the user's role
      const user = await this.prisma.customUser.findUnique({
        where: {
          id: payload.userId,
        },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      request.user = user;
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }
}
