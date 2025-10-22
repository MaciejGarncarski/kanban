import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { testEnv } from 'src/__tests__/env';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [() => testEnv],
    }),
  ],
})
export class TestConfigModule {}
