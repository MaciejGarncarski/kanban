import { ConfigService, registerAs } from '@nestjs/config';
import { ConfigType } from '@nestjs/config';
import { testEnv } from 'src/__tests__/env';
import { envSchema } from 'src/shared/configs/env.schema';

export const registerEnv = registerAs('ENV', () => {
  console.trace();

  return envSchema.parse(process.env);
});

export const registerEnvTest = registerAs('ENV', () => {
  return envSchema.parse(testEnv);
});

export function getEnvConfig(configService: ConfigService) {
  return configService.get<EnvConfig>('ENV');
}
export type EnvConfig = ConfigType<typeof registerEnv>;
