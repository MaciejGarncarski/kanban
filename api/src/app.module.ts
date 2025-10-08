import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DbModule } from 'src/db/db.module';
import { ClsModule } from 'nestjs-cls';
import { ClsPluginTransactional } from '@nestjs-cls/transactional';
import { TransactionalAdapterDrizzleOrm } from '@nestjs-cls/transactional-adapter-drizzle-orm';
import { DB_PROVIDER } from 'src/db/db.provider';
import { UserRepository } from 'src/user/user.repository';

@Module({
  imports: [
    DbModule,
    ClsModule.forRoot({
      global: true,
      plugins: [
        new ClsPluginTransactional({
          imports: [DbModule],
          adapter: new TransactionalAdapterDrizzleOrm({
            drizzleInstanceToken: DB_PROVIDER,
          }),
        }),
      ],
    }),
  ],
  controllers: [AppController],
  providers: [AppService, UserRepository],
})
export class AppModule {}
