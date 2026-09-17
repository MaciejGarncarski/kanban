import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { testEnv } from '../env.js';
import { accessTokenConfigTest } from '../../infrastructure/configs/access-token-cookie.config.js';
import { registerEnvTest } from '../../infrastructure/configs/env.config.js';
import { refreshTokenConfigTest } from '../../infrastructure/configs/refresh-token-cookie.config.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        () => testEnv,
        refreshTokenConfigTest,
        accessTokenConfigTest,
        registerEnvTest,
      ],
    }),
  ],
})
export class TestConfigModule {}
