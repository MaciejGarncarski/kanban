import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { seconds, ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { DbModule } from 'src/infrastructure/persistence/db/db.module';
import { validate } from 'src/infrastructure/configs/env.schema';
import { refreshTokenConfigTest } from 'src/infrastructure/configs/refresh-token-cookie.config';
import accessTokenCookieConfig from 'src/infrastructure/configs/access-token-cookie.config';
import { registerEnv } from 'src/infrastructure/configs/env.config';
import { CorrelationIdMiddleware } from 'src/infrastructure/middlewares/correlation-id.middleware';

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
      load: [refreshTokenConfigTest, accessTokenCookieConfig, registerEnv],
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
