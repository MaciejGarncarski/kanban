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
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getEnvConfig } from 'src/shared/configs/env.config';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const env = getEnvConfig(configService);

        if (!env || !env.JWT_SECRET) {
          throw new Error('JWT_SECRET is not defined in environment variables');
        }

        return {
          secret: env.JWT_SECRET,
          signOptions: { expiresIn: '10m' },
        };
      },
      inject: [ConfigService],
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
