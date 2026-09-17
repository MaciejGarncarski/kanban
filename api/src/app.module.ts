import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module.js';
import { UserModule } from './user/user.module.js';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { seconds, ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { DbModule } from './infrastructure/persistence/db/db.module.js';
import { validate } from './infrastructure/configs/env.schema.js';
import refreshTokenCookieConfig from './infrastructure/configs/refresh-token-cookie.config.js';
import accessTokenCookieConfig from './infrastructure/configs/access-token-cookie.config.js';
import {
  getEnvConfig,
  registerEnv,
} from './infrastructure/configs/env.config.js';
import { CorrelationIdMiddleware } from './infrastructure/middlewares/correlation-id.middleware.js';
import { JwtModule } from '@nestjs/jwt';
import { TeamModule } from './team/team.module.js';
import { BoardModule } from './board/board.module.js';
import { CardModule } from './card/card.module.js';
import { ColumnModule } from './column/column.module.js';
import { AppController } from './infrastructure/controllers/app.controller.js';
import { NotificationsModule } from './notifications/notifications.module.js';

const API_MODULES = [
  UserModule,
  AuthModule,
  TeamModule,
  BoardModule,
  CardModule,
  ColumnModule,
  NotificationsModule,
];

@Module({
  imports: [
    DbModule,
    ...API_MODULES,
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
          signOptions: { expiresIn: '10m' },
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
  ],
  controllers: [AppController],
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
