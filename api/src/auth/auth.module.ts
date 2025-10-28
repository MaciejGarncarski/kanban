import { Module } from '@nestjs/common';
import { UserRepository } from 'src/user/infrastructure/persistence/user.repository';
import { SignInUserHandler } from 'src/auth/application/commands/handlers/sign-in-user.handler';
import { RefreshAccessTokenHandler } from 'src/auth/application/commands/handlers/refresh-access-token.handler';
import { LogoutHandler } from 'src/auth/application/commands/handlers/logout.handler';
import { AuthController } from 'src/auth/infrastructure/controllers/auth.controller';
import { RefreshTokenRepository } from 'src/auth/infrastructure/persistence/refresh-token.repository';
import { GetMeHandler } from 'src/auth/application/queries/handlers/get-me.handler';
import { RegisterUserHandler } from 'src/auth/application/commands/handlers/register.handler';

const CommandHandlers = [
  RegisterUserHandler,
  SignInUserHandler,
  RefreshAccessTokenHandler,
  LogoutHandler,
];

@Module({
  controllers: [AuthController],
  providers: [
    ...CommandHandlers,
    GetMeHandler,
    UserRepository,
    RefreshTokenRepository,
  ],
})
export class AuthModule {}
