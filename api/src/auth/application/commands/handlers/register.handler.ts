import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenRepository } from 'src/auth/infrastructure/persistence/refresh-token.repository';
import { UserRepository } from 'src/user/infrastructure/persistence/user.repository';
import { RegisterCommand } from 'src/auth/application/commands/register.command';
import { hash } from '@node-rs/argon2';
import { UserResponseDto } from 'src/user/application/dtos/user.response.dto';
import { plainToInstance } from 'class-transformer';
import { JWTPayload } from 'src/auth/domain/token.types';
import { ProfanityCheckService } from 'src/infrastructure/services/profanity-check.service';

export type RegisterHandlerReturn = {
  user: UserResponseDto;
  accessToken: string;
  refreshToken: string;
  refreshTokenPlain: string;
};

@CommandHandler(RegisterCommand)
export class RegisterUserHandler implements ICommandHandler<RegisterCommand> {
  constructor(
    private readonly refreshTokenRepo: RefreshTokenRepository,
    private readonly userRepo: UserRepository,
    private jwtService: JwtService,
    private profanityCheckService: ProfanityCheckService,
  ) {}

  async execute(command: RegisterCommand): Promise<RegisterHandlerReturn> {
    if (command.password !== command.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const userByEmail = await this.userRepo.findByEmail(command.email);

    if (userByEmail) {
      throw new BadRequestException('Email already in use');
    }

    const isNameAProfanity = await this.profanityCheckService.isProfane(
      command.name,
    );

    if (isNameAProfanity) {
      throw new BadRequestException('Name contains inappropriate language');
    }

    const passwordHash = await hash(command.password);

    const user = await this.userRepo.create({
      email: command.email,
      name: command.name,
      password_hash: passwordHash,
    });

    const accessToken = this.jwtService.sign<JWTPayload>({
      sub: user.id,
    });

    const { tokenHash, tokenPlain } = await this.refreshTokenRepo.create(
      user.id,
    );

    return {
      accessToken,
      refreshToken: tokenHash,
      refreshTokenPlain: tokenPlain,
      user: plainToInstance(UserResponseDto, user, {
        excludeExtraneousValues: true,
      }),
    };
  }
}
