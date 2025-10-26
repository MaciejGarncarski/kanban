import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { SignInUserCommand } from 'src/auth/application/commands/sign-in-user.command';
import { JwtService } from '@nestjs/jwt';
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

    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }

    const isVerified = await user.checkPassword(command.password);

    if (!isVerified) {
      throw new BadRequestException('Invalid credentials');
    }

    const accessToken = this.jwtService.sign({
      id: user.id,
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
