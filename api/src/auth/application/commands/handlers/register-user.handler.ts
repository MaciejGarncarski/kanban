import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, Injectable } from '@nestjs/common';
import { UserRepository } from 'src/user/user.repository';
import { JwtService } from '@nestjs/jwt';
import { RegisterUserCommand } from 'src/auth/application/commands/register-user.command';

@Injectable()
@CommandHandler(RegisterUserCommand)
export class RegisterUserHandler
  implements ICommandHandler<RegisterUserCommand>
{
  constructor(
    private readonly userRepo: UserRepository,
    private jwtService: JwtService,
  ) {}

  async execute(command: RegisterUserCommand): Promise<{ token: string }> {
    const user = await this.userRepo.findByEmail(command.email);

    if (user) {
      throw new BadRequestException('User already exists');
    }

    // const token = this.jwtService.sign({
    //   id: user.id,
    // });

    return { token: 'xd' };
    // return { token };
  }
}
