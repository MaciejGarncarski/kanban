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

    const payload = { id: 'user123' };
    jest.spyOn(jwtService, 'verify').mockReturnValue(payload);

    const result = await guard.canActivate(mockContext);
    expect(result).toBe(true);
    expect(mockRequest.userId).toBe(payload.id);
  });

  it('should extract token from cookies if signed cookies are empty', async () => {
    const token = 'cookie-token';
    mockRequest.cookies = { accessToken: token };

    const payload = { id: 'user456' };
    jest.spyOn(jwtService, 'verify').mockReturnValue(payload);

    const result = await guard.canActivate(mockContext);
    expect(result).toBe(true);
    expect(mockRequest.userId).toBe(payload.id);
  });

  it('should extract token from Authorization header', async () => {
    const token = 'header-token';
    mockRequest.headers = { authorization: `Bearer ${token}` };

    const payload = { id: 'user789' };
    jest.spyOn(jwtService, 'verify').mockReturnValue(payload);

    const result = await guard.canActivate(mockContext);
    expect(result).toBe(true);
    expect(mockRequest.userId).toBe(payload.id);
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
});
