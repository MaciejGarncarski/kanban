import { MiddlewareConsumer, Module } from '@nestjs/common';
import { DbModule } from 'src/db/db.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import refreshTokenConfig from 'src/shared/configs/refresh-token-cookie.config';
import { CorrelationIdMiddleware } from 'src/shared/middlewares/correlation-id.middleware';
import { validate } from 'src/shared/configs/env.schema';
import { registerEnv } from 'src/shared/configs/env.config';
import accessTokenCookieConfig from 'src/shared/configs/access-token-cookie.config';
import { seconds, ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    DbModule,
    UserModule,
    AuthModule,
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: seconds(60),
        limit: 10,
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
      load: [refreshTokenConfig, accessTokenCookieConfig, registerEnv],
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
