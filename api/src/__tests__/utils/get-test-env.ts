import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { testEnv } from 'src/__tests__/env';
import { accessTokenConfigTest } from 'src/shared/configs/access-token-cookie.config';
import { registerEnvTest } from 'src/shared/configs/env.config';
import { refreshTokenConfigTest } from 'src/shared/configs/refresh-token-cookie.config';

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
