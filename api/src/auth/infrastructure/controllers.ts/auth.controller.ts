import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiResponse } from '@nestjs/swagger';
import { SignInUserCommand } from 'src/auth/application/commands/sign-in-user.command';
import { SignInBody } from 'src/auth/application/dtos/sign-in-body.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Post('sign-in')
  @ApiResponse({
    status: 200,
    description: 'Signed in user',
  })
  getAuth(@Body() body: SignInBody) {
    return this.commandBus.execute(
      new SignInUserCommand(body.email, body.password),
    );
  }
}
