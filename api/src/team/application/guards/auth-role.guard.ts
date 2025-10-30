import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { JWTPayload } from 'src/auth/domain/token.types';
import { TeamRepository } from 'src/team/infrastructure/persistence/team.repository';

@Injectable()
export class AuthRoleGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly teamRepo: TeamRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const payload = this.jwtService.verify<JWTPayload>(token);
      request.userId = payload.id;

      const boardId = request.params.boardId;
      const role = await this.teamRepo.getUserRole(boardId, payload.id);
      if (!role) throw new UnauthorizedException('No access');

      request.userRole = role;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private extractToken(request: Request): string | null {
    const accessTokenCookieSigned = request.signedCookies?.['accessToken'] as
      | string
      | undefined;

    if (accessTokenCookieSigned) {
      return accessTokenCookieSigned;
    }

    const accessTokenCookie = request.cookies?.['accessToken'] as
      | string
      | undefined;

    if (accessTokenCookie) {
      return accessTokenCookie;
    }

    const authHeader = request.headers?.['authorization'];
    if (!authHeader) return null;

    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : null;
  }
}
