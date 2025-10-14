import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiResponse } from '@nestjs/swagger';
import { type Response } from 'express';
import { SignInUserCommand } from 'src/auth/application/commands/sign-in-user.command';
import { JWTPayload } from 'src/auth/application/config/jwt-payload';
import { SignInBody } from 'src/auth/application/dtos/sign-in-body.dto';
import { GetSessionQuery } from 'src/auth/application/queries/get-session.query';

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
  async signInUser(
    @Body() body: SignInBody,
    @Res({ passthrough: true }) response: Response,
  ) {
    const data = await this.commandBus.execute<
      SignInUserCommand,
      { token: string }
    >(new SignInUserCommand(body.email, body.password));

    response.cookie('jwt', JSON.stringify({ token: data.token }));

    return { token: data.token };
  }

  @HttpCode(HttpStatus.OK)
  @Post('register')
  @ApiResponse({
    status: 200,
    description: 'Signed in user',
  })
  registerUser(@Body() body: SignInBody) {
    return this.commandBus.execute(
      new SignInUserCommand(body.email, body.password),
    );
  }

  @HttpCode(HttpStatus.OK)
  @Get('me')
  @ApiResponse({
    status: 200,
    description: 'Signed in user',
  })
  async checkCurrentSession() {
    const data = await this.queryBus.execute<GetSessionQuery, JWTPayload>(
      new GetSessionQuery(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjAxOTllNDgzLWRiOGUtNzYwMC1hNzlkLTk2NjZhNGZlMmQxZiIsImlhdCI6MTc2MDQ3NjkzOCwiZXhwIjoxNzYwNTIwMTM4fQ.jd25XKTdAGHzZJBQ_EHY2_PwMe9HUaVxn6uURrstBUs',
      ),
    );

    return data;
  }
}
