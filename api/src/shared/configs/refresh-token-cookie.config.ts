import { registerAs } from '@nestjs/config';
import { REFRESH_TOKEN_MAX_AGE } from 'src/shared/constants/cookie.const';
import { envSchema } from 'src/shared/configs/env.schema';

export interface CookieConfig {
  secret: string;
  name: string;
  secure: boolean;
  maxAge: number;
  httpOnly: boolean;
  signed: boolean;
}

export default registerAs('refresh-token-cookie', (): CookieConfig => {
  const env = envSchema.parse(process.env);

  return {
    secret: env.COOKIE_SECRET,
    name: 'refreshToken',
    httpOnly: true,
    secure: env.COOKIE_SECURE === true,
    maxAge: REFRESH_TOKEN_MAX_AGE,
    signed: true,
  };
});
