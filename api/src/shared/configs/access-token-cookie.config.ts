import { registerAs } from '@nestjs/config';
import { ACCESS_TOKEN_MAX_AGE } from 'src/shared/constants/cookie.const';
import { envSchema } from 'src/shared/configs/env.schema';
import { testEnv } from 'src/__tests__/env';

export interface CookieConfig {
  secret: string;
  name: string;
  secure: boolean;
  maxAge: number;
  httpOnly: boolean;
  signed: boolean;
  sameSite: 'lax' | 'strict' | 'none';
  domain: string;
}

export const ACCESS_TOKEN_COOKIE_CONFIG_KEY = 'access-token-cookie';
export default registerAs(ACCESS_TOKEN_COOKIE_CONFIG_KEY, (): CookieConfig => {
  const env = envSchema.parse(process.env);

  return {
    secret: env.COOKIE_SECRET,
    name: 'accessToken',
    httpOnly: true,
    secure: env.COOKIE_SECURE === true,
    maxAge: ACCESS_TOKEN_MAX_AGE,
    signed: true,
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
      signed: true,
      sameSite: 'lax',
      domain: env.WEB_DOMAIN,
    };
  },
);
