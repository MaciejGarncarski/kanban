import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UnauthorizedException } from '@nestjs/common';
import { RefreshAccessTokenCommand } from 'src/auth/application/commands/refresh-access-token.command';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenRepository } from 'src/auth/infrastructure/persistence/refresh-token.repository';

export type RefreshAccessTokenReturn = {
  accessToken: string;
  newRefreshToken: string;
  newRefreshTokenHash: string;
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

    const rotatedToken = await this.refreshTokenRepo.rotate(tokenRecord);

    const accessToken = this.jwtService.sign({
      id: rotatedToken.entity.userId,
    });

    return {
      accessToken,
      newRefreshToken: rotatedToken.tokenPlain,
      newRefreshTokenHash: rotatedToken.tokenHash,
    };
  }
}
