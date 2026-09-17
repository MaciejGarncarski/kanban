import { registerAs } from '@nestjs/config';
import { ACCESS_TOKEN_MAX_AGE } from '../../shared/constants/cookie.const.js';
import { testEnv } from '../../__tests__/env.js';
import { envSchema } from './env.schema.js';
import { CookieConfig } from './cookie-config.type.js';

export const ACCESS_TOKEN_COOKIE_CONFIG_KEY = 'access-token-cookie';
export default registerAs(ACCESS_TOKEN_COOKIE_CONFIG_KEY, (): CookieConfig => {
  const env = envSchema.parse(process.env);

  return {
    secret: env.COOKIE_SECRET,
    name: 'accessToken',
    httpOnly: true,
    secure: env.COOKIE_SECURE === true,
    maxAge: ACCESS_TOKEN_MAX_AGE,
    signed: false,
    sameSite: 'lax',
    domain: env.WEB_DOMAIN,
  };
});

export const accessTokenConfigTest = registerAs(
  ACCESS_TOKEN_COOKIE_CONFIG_KEY,
  (): CookieConfig => {
    const env = envSchema.parse(testEnv);

    return {
      secret: env.COOKIE_SECRET,
      name: 'accessToken',
      httpOnly: true,
      secure: env.COOKIE_SECURE === true,
      maxAge: ACCESS_TOKEN_MAX_AGE,
      signed: false,
      sameSite: 'lax',
      domain: env.WEB_DOMAIN,
    };
  },
);
