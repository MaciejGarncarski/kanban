import { JwtService } from '@nestjs/jwt';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthGuard } from 'src/core/application/guards/auth.guard';
import { CommandBus } from '@nestjs/cqrs';
import { refreshTokenConfigTest } from 'src/infrastructure/configs/refresh-token-cookie.config';
import { accessTokenConfigTest } from 'src/infrastructure/configs/access-token-cookie.config';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let jwtService: JwtService;
  let mockContext: ExecutionContext;
  let mockRequest: Partial<Request>;
  let commandBus: CommandBus;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    jwtService = new JwtService({ secret: 'test' });
    commandBus = {
      execute: jest.fn(),
    } as unknown as CommandBus;

    guard = new AuthGuard(
      jwtService,
      commandBus,
      refreshTokenConfigTest(),
      accessTokenConfigTest(),
    );

    mockRequest = {
      cookies: {},
      signedCookies: {},
      headers: {},
    };

    mockResponse = {
      json: jest.fn(),
    };

    mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest as Request,
        getResponse: () => mockResponse as Response,
      }),
    } as ExecutionContext;
  });

  it('should throw UnauthorizedException if no token is provided', async () => {
    await expect(guard.canActivate(mockContext)).rejects.toThrow(
      new UnauthorizedException('No refresh token provided'),
    );
  });

  it('should extract token from signed cookies and verify successfully', async () => {
    const token = 'signed-token';
    mockRequest.signedCookies = { accessToken: token };

    const payload = { sub: 'user123' };
    jest.spyOn(jwtService, 'verify').mockReturnValue(payload);

    const result = await guard.canActivate(mockContext);
    expect(result).toBe(true);
    expect(mockRequest.userId).toBe(payload.sub);
  });

  it('should extract token from cookies if signed cookies are empty', async () => {
    const token = 'cookie-token';
    mockRequest.cookies = { accessToken: token };

    const payload = { sub: 'user456' };
    jest.spyOn(jwtService, 'verify').mockReturnValue(payload);

    const result = await guard.canActivate(mockContext);
    expect(result).toBe(true);
    expect(mockRequest.userId).toBe(payload.sub);
  });

  it('should extract token from Authorization header', async () => {
    const token = 'header-token';
    mockRequest.headers = { authorization: `Bearer ${token}` };

    const payload = { sub: 'user789' };
    jest.spyOn(jwtService, 'verify').mockReturnValue(payload);

    const result = await guard.canActivate(mockContext);
    expect(result).toBe(true);
    expect(mockRequest.userId).toBe(payload.sub);
  });

  it('should throw UnauthorizedException if token is invalid', async () => {
    const token = 'bad-token';
    mockRequest.headers = { authorization: `Bearer ${token}` };

    jest.spyOn(jwtService, 'verify').mockImplementation(() => {
      throw new Error('invalid');
    });

    await expect(guard.canActivate(mockContext)).rejects.toThrow(
      new UnauthorizedException('No refresh token provided'),
    );
  });

  it('should handle malformed Authorization header gracefully', async () => {
    mockRequest.headers = { authorization: 'BadHeader' };

    await expect(guard.canActivate(mockContext)).rejects.toThrow(
      new UnauthorizedException('No refresh token provided'),
    );
  });

  it('should refresh access token if expired and valid refresh token is provided', async () => {
    const expiredToken = 'expired-token';
    const refreshToken = 'valid-refresh-token';
    mockRequest.signedCookies = { accessToken: expiredToken, refreshToken };

    jest.spyOn(jwtService, 'verify').mockImplementation(() => {
      const error: any = new Error('jwt expired');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      error.name = 'TokenExpiredError';
      throw error;
    });

    const newAccessToken = 'new-access-token';
    const newRefreshToken = 'new-refresh-token';
    (commandBus.execute as jest.Mock).mockResolvedValue({
      accessToken: newAccessToken,
      newRefreshToken,
    });

    jest.spyOn(jwtService, 'verify').mockReturnValue({ sub: 'user999' });

    const result = await guard.canActivate(mockContext);
    expect(result).toBe(true);
    expect(mockRequest.userId).toBe('user999');
  });

  it('should throw UnauthorizedException if refresh token is invalid', async () => {
    const expiredToken = 'expired-token';
    const refreshToken = 'invalid-refresh-token';
    mockRequest.signedCookies = { accessToken: expiredToken, refreshToken };

    jest.spyOn(jwtService, 'verify').mockImplementation(() => {
      const error: any = new Error('jwt expired');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      error.name = 'TokenExpiredError';
      throw error;
    });

    (commandBus.execute as jest.Mock).mockRejectedValue(
      new Error('Invalid refresh token'),
    );

    await expect(guard.canActivate(mockContext)).rejects.toThrow(
      new UnauthorizedException('Could not refresh access token'),
    );
  });

  it('should throw UnauthorizedException for other token errors', async () => {
    const badToken = 'bad-token';
    mockRequest.signedCookies = { accessToken: badToken, refreshToken: 'test' };

    jest.spyOn(jwtService, 'verify').mockImplementation(() => {
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw 'not an error instance';
    });

    await expect(guard.canActivate(mockContext)).rejects.toThrow(
      new UnauthorizedException('Invalid or expired token'),
    );
  });

  it('should return true for valid access token in cookies', async () => {
    const token = 'valid-token';
    mockRequest.cookies = { accessToken: token };

    const payload = { sub: 'userCookie' };
    jest.spyOn(jwtService, 'verify').mockReturnValue(payload);

    const result = await guard.canActivate(mockContext);
    expect(result).toBe(true);
    expect(mockRequest.userId).toBe(payload.sub);
  });
});
