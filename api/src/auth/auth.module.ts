import { Module } from '@nestjs/common';
import { UserRepository } from 'src/user/infrastructure/persistence/user.repository';
import { SignInUserHandler } from 'src/auth/application/commands/handlers/sign-in-user.handler';
import { JwtModule } from '@nestjs/jwt';
import { GetSessionHandler } from 'src/auth/application/queries/handlers/get-session.handler';
import { CqrsModule } from '@nestjs/cqrs';
import { RefreshAccessTokenHandler } from 'src/auth/application/commands/handlers/refresh-access-token.handler';
import { LogoutHandler } from 'src/auth/application/commands/handlers/logout.handler';
import { AuthController } from 'src/auth/infrastructure/controllers/auth.controller';
import { RefreshTokenRepository } from 'src/auth/infrastructure/persistence/refresh-token.repository';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '10m' },
    }),
    CqrsModule,
  ],
  controllers: [AuthController],
  providers: [
    SignInUserHandler,
    GetSessionHandler,
    RefreshAccessTokenHandler,
    LogoutHandler,
    UserRepository,
    RefreshTokenRepository,
  ],
})
export class AuthModule {}
