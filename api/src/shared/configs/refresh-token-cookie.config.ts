import { registerAs } from '@nestjs/config';
import { REFRESH_TOKEN_MAX_AGE } from 'src/shared/constants/cookie.const';
import { envSchema } from 'src/shared/configs/env.schema';
import { testEnv } from 'src/__tests__/env';

export interface CookieConfig {
  secret: string;
  name: string;
  secure: boolean;
  maxAge: number;
  httpOnly: boolean;
  signed: boolean;
}

export const REFRESH_TOKEN_COOKIE_CONFIG_KEY = 'refresh-token-cookie';
export default registerAs(REFRESH_TOKEN_COOKIE_CONFIG_KEY, (): CookieConfig => {
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

export const refreshTokenConfigTest = registerAs(
  REFRESH_TOKEN_COOKIE_CONFIG_KEY,
  (): CookieConfig => {
    const env = envSchema.parse(testEnv);

    return {
      secret: env.COOKIE_SECRET,
      name: 'refreshToken',
      httpOnly: true,
      secure: env.COOKIE_SECURE === true,
      maxAge: REFRESH_TOKEN_MAX_AGE,
      signed: true,
    };
  },
);
