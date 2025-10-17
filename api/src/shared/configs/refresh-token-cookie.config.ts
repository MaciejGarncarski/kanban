import { registerAs } from '@nestjs/config';
import { REFRESH_TOKEN_MAX_AGE } from 'src/shared/constants/cookie.const';

export interface CookieConfig {
  secret: string;
  name: string;
  secure: boolean;
  maxAge: number;
  httpOnly: boolean;
  signed: boolean;
}

export default registerAs(
  'refresh-token-cookie',
  (): CookieConfig => ({
    secret: process.env.COOKIE_SECRET!,
    name: 'refreshToken',
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === 'true',
    maxAge: REFRESH_TOKEN_MAX_AGE,
    signed: true,
  }),
);
