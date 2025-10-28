import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { seconds, ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { DbModule } from 'src/infrastructure/persistence/db/db.module';
import { validate } from 'src/infrastructure/configs/env.schema';
import refreshTokenCookieConfig from 'src/infrastructure/configs/refresh-token-cookie.config';
import accessTokenCookieConfig from 'src/infrastructure/configs/access-token-cookie.config';
import {
  getEnvConfig,
  registerEnv,
} from 'src/infrastructure/configs/env.config';
import { CorrelationIdMiddleware } from 'src/infrastructure/middlewares/correlation-id.middleware';
import { TeamsModule } from 'src/teams/teams.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    DbModule,
    UserModule,
    AuthModule,
    TeamsModule,
    CqrsModule.forRoot(),
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const env = getEnvConfig(configService);

        if (!env || !env.JWT_SECRET) {
          throw new Error('JWT_SECRET is not defined in environment variables');
        }

        return {
          secret: env.JWT_SECRET,
          signOptions: { expiresIn: '5m' },
        };
      },
      inject: [ConfigService],
    }),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: seconds(60),
        limit: 50,
      },
      {
        name: 'long',
        ttl: seconds(60),
        limit: 100,
      },
    ]),
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validate,
      envFilePath: ['.env'],
      load: [refreshTokenCookieConfig, accessTokenCookieConfig, registerEnv],
    }),
    CqrsModule.forRoot(),
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
