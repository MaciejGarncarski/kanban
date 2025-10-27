import { CookieOptions, Response } from 'express';
import { CookieConfig } from 'src/infrastructure/configs/cookie-config.type';

export function setTokenCookie(
  response: Response,
  config: CookieConfig,
  token: string,
) {
  const cookieOptions = {
    httpOnly: config.httpOnly,
    secure: config.secure,
    maxAge: config.maxAge,
    sameSite: config.sameSite,
    domain: config.domain,
    signed: config.signed,
  } as CookieOptions;

  console.log(cookieOptions);

  response.cookie(config.name, token, cookieOptions);
}

export function clearTokenCookie(response: Response, config: CookieConfig) {
  response.clearCookie(config.name, {
    secure: config.secure,
    httpOnly: config.httpOnly,
    maxAge: config.maxAge,
    signed: config.signed,
    domain: config.domain,
    sameSite: config.sameSite,
  });
}
