import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UnauthorizedException } from '@nestjs/common';
import { RefreshAccessTokenCommand } from 'src/auth/application/commands/refresh-access-token.command';
import { randomBytes } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenRepository } from 'src/auth/infrastructure/persistence/refresh-token.repository';

export type RefreshAccessTokenReturn = {
  accessToken: string;
  refreshToken: string;
};

@CommandHandler(RefreshAccessTokenCommand)
export class RefreshAccessTokenHandler
  implements ICommandHandler<RefreshAccessTokenCommand>
{
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

    const newRefreshTokenPlain = randomBytes(32).toString('hex');
    const newToken = await this.refreshTokenRepo.rotate(
      tokenRecord,
      newRefreshTokenPlain,
    );

    const accessToken = this.jwtService.sign({
      id: newToken.userId,
    });

    return { accessToken, refreshToken: newRefreshTokenPlain };
  }
}
