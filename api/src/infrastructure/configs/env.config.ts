import { ConfigService, registerAs } from '@nestjs/config';
import { ConfigType } from '@nestjs/config';
import { testEnv } from '../../__tests__/env.js';
import { envSchema } from './env.schema.js';

export const registerEnv = registerAs('ENV', () => {
  return envSchema.parse(process.env);
});

export const registerEnvTest = registerAs('ENV', () => {
  return envSchema.parse(testEnv);
});

export function getEnvConfig(configService: ConfigService) {
  return configService.get<EnvConfig>('ENV');
}
export type EnvConfig = ConfigType<typeof registerEnv>;
