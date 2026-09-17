import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenRepository } from '../../../infrastructure/persistence/refresh-token.repository.js';
import { UserRepository } from '../../../../user/infrastructure/persistence/user.repository.js';
import { RegisterCommand } from '../register.command.js';
import { hash } from '@node-rs/argon2';
import {
  UserResponseDto,
  userResponseSchema,
} from '../../../../user/application/dtos/user.response.dto.js';
import { parseResponse } from '../../../../infrastructure/validation/parse-response.js';
import { JWTPayload } from '../../../domain/token.types.js';
import { ProfanityCheckService } from '../../../../infrastructure/services/profanity-check.service.js';

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
      user: parseResponse<UserResponseDto>(userResponseSchema, user),
    };
  }
}
