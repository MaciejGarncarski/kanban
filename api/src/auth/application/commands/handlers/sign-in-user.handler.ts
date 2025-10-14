import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, Injectable } from '@nestjs/common';
import { SignInUserCommand } from 'src/auth/application/commands/sign-in-user.command';
import { UserRepository } from 'src/user/user.repository';
import { verify } from '@node-rs/argon2';
import { JwtService } from '@nestjs/jwt';

@Injectable()
@CommandHandler(SignInUserCommand)
export class SignInUserHandler implements ICommandHandler<SignInUserCommand> {
  constructor(
    private readonly userRepo: UserRepository,
    private jwtService: JwtService,
  ) {}

  async execute(command: SignInUserCommand): Promise<{ token: string }> {
    const user = await this.userRepo.findByEmail(command.email);

    const isVerified = await verify(user.password_hash, command.password);

    if (!isVerified) {
      throw new BadRequestException('Invalid credentials');
    }

    const token = this.jwtService.sign({
      id: user.id,
    });

    return { token };
  }
}
