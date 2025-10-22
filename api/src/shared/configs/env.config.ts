import { ConfigService, registerAs } from '@nestjs/config';
import { ConfigType } from '@nestjs/config';
import { envSchema } from 'src/shared/configs/env.schema';

export const registerEnv = registerAs('ENV', () => {
  return envSchema.parse(process.env);
});
export function getEnvConfig(configService: ConfigService) {
  return configService.get<EnvConfig>('ENV');
}
export type EnvConfig = ConfigType<typeof registerEnv>;
