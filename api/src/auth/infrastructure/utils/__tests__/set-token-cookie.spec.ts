/* eslint-disable @typescript-eslint/unbound-method */
import { type Response } from 'express';
import {
  clearTokenCookie,
  setTokenCookie,
} from 'src/auth/infrastructure/utils/set-token-cookie';
import { CookieConfig } from 'src/infrastructure/configs/cookie-config.type';

describe('setTokenCookie', () => {
  let response: Response;

  const mockCookieConfig: CookieConfig = {
    name: 'testToken',
    httpOnly: true,
    secure: false,
    maxAge: 3600000,
    sameSite: 'lax',
    domain: 'localhost',
    signed: false,
    secret: '',
  };

  beforeEach(() => {
    response = {
      cookie: jest.fn(),
      clearCookie: jest.fn(),
    } as unknown as Response;
  });

  describe('setTokenCookie', () => {
    it('should set the token cookie with correct options', () => {
      const token = 'sampleToken';

      // Call the function
      setTokenCookie(response, mockCookieConfig, token);

      // Assert that response.cookie was called with correct parameters
      expect(response.cookie).toHaveBeenCalledWith(
        mockCookieConfig.name,
        token,
        expect.objectContaining({
          httpOnly: mockCookieConfig.httpOnly,
          secure: mockCookieConfig.secure,
          maxAge: mockCookieConfig.maxAge,
          sameSite: mockCookieConfig.sameSite,
          domain: mockCookieConfig.domain,
          signed: mockCookieConfig.signed,
        }),
      );
    });
  });

  describe('clearTokenCookie', () => {
    it('should clear the token cookie with correct options', () => {
      // Call the function
      clearTokenCookie(response, mockCookieConfig);
      // Assert that response.clearCookie was called with correct parameters
      expect(response.clearCookie).toHaveBeenCalledWith(
        mockCookieConfig.name,
        expect.objectContaining({
          httpOnly: mockCookieConfig.httpOnly,
          secure: mockCookieConfig.secure,
          maxAge: mockCookieConfig.maxAge,
          sameSite: mockCookieConfig.sameSite,
          domain: mockCookieConfig.domain,
          signed: mockCookieConfig.signed,
        }),
      );
    });
  });
});
