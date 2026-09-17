import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { SignInUserCommand } from '../sign-in-user.command.js';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenRepository } from '../../../infrastructure/persistence/refresh-token.repository.js';
import { UserRepository } from '../../../../user/infrastructure/persistence/user.repository.js';
import { JWTPayload } from '../../../domain/token.types.js';

export type SignInUserCommandReturn = {
  accessToken: string;
  refreshToken: string;
  refreshTokenHash: string;
};

@CommandHandler(SignInUserCommand)
export class SignInUserHandler implements ICommandHandler<SignInUserCommand> {
  constructor(
    private readonly refreshTokenRepo: RefreshTokenRepository,
    private readonly userRepo: UserRepository,
    private jwtService: JwtService,
  ) {}

  async execute(command: SignInUserCommand): Promise<SignInUserCommandReturn> {
    const user = await this.userRepo.findByEmail(command.email);

    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }

    const isVerified = await user.checkPassword(command.password);

    if (!isVerified) {
      throw new BadRequestException('Invalid credentials');
    }

    const accessToken = this.jwtService.sign<JWTPayload>({
      sub: user.id,
    });

    const { tokenHash, tokenPlain } = await this.refreshTokenRepo.create(
      user.id,
    );

    return {
      accessToken,
      refreshToken: tokenPlain,
      refreshTokenHash: tokenHash,
    };
  }
}
