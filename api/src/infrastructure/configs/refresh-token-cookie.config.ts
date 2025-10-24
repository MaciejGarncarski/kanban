import { registerAs } from '@nestjs/config';
import { REFRESH_TOKEN_MAX_AGE } from 'src/shared/constants/cookie.const';
import { testEnv } from 'src/__tests__/env';
import { envSchema } from 'src/infrastructure/configs/env.schema';

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
