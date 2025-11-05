import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { type Request, type Response } from 'express';
import { RefreshAccessTokenReturn } from 'src/auth/application/commands/handlers/refresh-access-token.handler';
import { RefreshAccessTokenCommand } from 'src/auth/application/commands/refresh-access-token.command';
import { JWTPayload } from 'src/auth/domain/token.types';
import { setTokenCookie } from 'src/auth/infrastructure/utils/set-token-cookie';
import accessTokenCookieConfig from 'src/infrastructure/configs/access-token-cookie.config';
import refreshTokenCookieConfig from 'src/infrastructure/configs/refresh-token-cookie.config';
import { type ConfigType } from '@nestjs/config';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly commandBus: CommandBus,
    @Inject(refreshTokenCookieConfig.KEY)
    private readonly refreshTokenConf: ConfigType<
      typeof refreshTokenCookieConfig
    >,
    @Inject(accessTokenCookieConfig.KEY)
    private readonly accessTokenConf: ConfigType<
      typeof accessTokenCookieConfig
    >,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const refreshToken = this.extractRefreshToken(request);
    const accessToken = this.extractAccessToken(request);

    try {
      if (!accessToken) {
        throw Error('No access token provided');
      }

      const payload = this.jwtService.verify<JWTPayload>(accessToken);
      request.userId = payload.sub;

      return true;
    } catch (error) {
      if (!refreshToken) {
        throw new UnauthorizedException('No refresh token provided');
      }

      if (error instanceof Error) {
        if (
          error.name === 'TokenExpiredError' ||
          error.message === 'No access token provided'
        ) {
          try {
            const { accessToken, newRefreshToken } =
              await this.commandBus.execute<
                RefreshAccessTokenCommand,
                RefreshAccessTokenReturn
              >(new RefreshAccessTokenCommand(refreshToken));

            const verifiedToken =
              this.jwtService.verify<JWTPayload>(accessToken);

            setTokenCookie(response, this.refreshTokenConf, newRefreshToken);
            setTokenCookie(response, this.accessTokenConf, accessToken);
            request.userId = verifiedToken.sub;

            return true;
          } catch {
            throw new UnauthorizedException('Could not refresh access token');
          }
        }
      }
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private extractRefreshToken(request: Request): string | null {
    const refreshTokenCookieSigned = request.signedCookies?.['refreshToken'] as
      | string
      | undefined;

    if (refreshTokenCookieSigned) {
      return refreshTokenCookieSigned;
    }

    return null;
  }

  private extractAccessToken(request: Request): string | null {
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
