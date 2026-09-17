import { registerAs } from '@nestjs/config';
import { REFRESH_TOKEN_MAX_AGE } from '../../shared/constants/cookie.const.js';
import { testEnv } from '../../__tests__/env.js';
import { envSchema } from './env.schema.js';
import { CookieConfig } from './cookie-config.type.js';

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
    sameSite: 'lax',
    domain: env.WEB_DOMAIN,
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
      sameSite: 'lax',
      domain: env.WEB_DOMAIN,
    };
  },
);
