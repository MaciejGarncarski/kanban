import { Module } from '@nestjs/common';
import { UserRepository } from '../user/infrastructure/persistence/user.repository.js';
import { SignInUserHandler } from './application/commands/handlers/sign-in-user.handler.js';
import { RefreshAccessTokenHandler } from './application/commands/handlers/refresh-access-token.handler.js';
import { LogoutHandler } from './application/commands/handlers/logout.handler.js';
import { AuthController } from './infrastructure/controllers/auth.controller.js';
import { RefreshTokenRepository } from './infrastructure/persistence/refresh-token.repository.js';
import { GetMeHandler } from './application/queries/handlers/get-me.handler.js';
import { RegisterUserHandler } from './application/commands/handlers/register.handler.js';
import { ProfanityCheckService } from '../infrastructure/services/profanity-check.service.js';

const CommandHandlers = [
  RegisterUserHandler,
  SignInUserHandler,
  RefreshAccessTokenHandler,
  LogoutHandler,
];
const QueryHandlers = [GetMeHandler];
const Repositories = [UserRepository, RefreshTokenRepository];
@Module({
  controllers: [AuthController],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    ...Repositories,
    ProfanityCheckService,
  ],
})
export class AuthModule {}
