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

@Module({
  imports: [
    DbModule,
    UserModule,
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validate,
      envFilePath: ['.env'],
      load: [refreshTokenConfig, registerEnv],
    }),
    CqrsModule.forRoot(),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
