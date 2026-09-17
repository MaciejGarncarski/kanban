import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UnauthorizedException } from '@nestjs/common';
import { RefreshAccessTokenCommand } from '../refresh-access-token.command.js';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenRepository } from '../../../infrastructure/persistence/refresh-token.repository.js';
import { JWTPayload } from '../../../domain/token.types.js';

export type RefreshAccessTokenReturn = {
  accessToken: string;
  newRefreshToken: string;
  newRefreshTokenHash: string;
};

@CommandHandler(RefreshAccessTokenCommand)
export class RefreshAccessTokenHandler implements ICommandHandler<RefreshAccessTokenCommand> {
  constructor(
    private readonly jwtService: JwtService,
    private readonly refreshTokenRepo: RefreshTokenRepository,
  ) {}

  async execute(
    command: RefreshAccessTokenCommand,
  ): Promise<RefreshAccessTokenReturn> {
    const tokenRecord = await this.refreshTokenRepo.findActiveByToken(
      command.refreshToken,
    );

    if (!tokenRecord) {
      throw new UnauthorizedException('Token not found or inactive');
    }

    const rotatedToken = await this.refreshTokenRepo.rotate(tokenRecord);

    const accessToken = this.jwtService.sign<JWTPayload>({
      sub: rotatedToken.entity.userId,
    });

    return {
      accessToken,
      newRefreshToken: rotatedToken.tokenPlain,
      newRefreshTokenHash: rotatedToken.tokenHash,
    };
  }
}
