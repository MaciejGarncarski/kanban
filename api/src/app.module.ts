import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DbModule } from 'src/db/db.module';
import { UserRepository } from 'src/user/user.repository';
import { AuthModule } from './auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';

@Module({
  imports: [
    DbModule,
    UserModule,
    AuthModule,
    ConfigModule.forRoot(),
    CqrsModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService, UserRepository],
})
export class AppModule {}
