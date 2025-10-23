import { Response } from 'supertest';

export function getCookieFromResponse(
  response: Response,
  cookieName: string,
): string | undefined {
  const setCookie = response.headers['set-cookie'] as
    | string
    | string[]
    | undefined;

  const cookies = Array.isArray(setCookie)
    ? setCookie
    : [setCookie].filter(Boolean);

  return cookies.find((cookie) => cookie?.startsWith(`${cookieName}=`));
}
