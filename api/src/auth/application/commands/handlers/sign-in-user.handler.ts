import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { SignInUserCommand } from 'src/auth/application/commands/sign-in-user.command';
import { verify } from '@node-rs/argon2';
import { JwtService } from '@nestjs/jwt';
import { RefreshToken } from 'src/auth/domain/refresh-token.entity';
import { randomBytes } from 'crypto';
import { sha256 } from 'src/shared/utils/sha256.utils';
import { RefreshTokenRepository } from 'src/auth/infrastructure/persistence/refresh-token.repository';
import { UserRepository } from 'src/user/infrastructure/persistence/user.repository';

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

    const isVerified = await verify(user.password_hash, command.password);

    if (!isVerified) {
      throw new BadRequestException('Invalid credentials');
    }

    const accessToken = this.jwtService.sign({
      id: user.id,
    });

    const newRefreshTokenPlain = randomBytes(32).toString('hex');
    const refreshToken = RefreshToken.createNew(user.id);
    const refreshTokenHash = sha256(newRefreshTokenPlain);

    await this.refreshTokenRepo.create(
      user.id,
      newRefreshTokenPlain,
      refreshToken.expiresAt,
    );

    return {
      accessToken,
      refreshToken: newRefreshTokenPlain,
      refreshTokenHash,
    };
  }
}
