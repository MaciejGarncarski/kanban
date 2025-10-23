import { JwtService } from '@nestjs/jwt';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from 'src/auth/common/guards/auth.guard';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let jwtService: JwtService;
  let mockContext: ExecutionContext;
  let mockRequest: Partial<Request>;

  beforeEach(() => {
    jwtService = new JwtService({ secret: 'test' });
    guard = new AuthGuard(jwtService);

    mockRequest = {
      cookies: {},
      signedCookies: {},
      headers: {},
    };

    mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as ExecutionContext;
  });

  it('should throw if no token is provided', () => {
    expect(() => guard.canActivate(mockContext)).toThrow(
      new UnauthorizedException('No token provided'),
    );
  });

  it('should extract token from signed cookies and verify successfully', () => {
    const token = 'signed-token';
    mockRequest.signedCookies = { accessToken: token };

    const payload = { id: 'user123' };
    jest.spyOn(jwtService, 'verify').mockReturnValue(payload);

    const result = guard.canActivate(mockContext);
    expect(result).toBe(true);
    expect(mockRequest.userId).toBe(payload.id);
  });

  it('should extract token from cookies if signed cookies are empty', () => {
    const token = 'cookie-token';
    mockRequest.cookies = { accessToken: token };

    const payload = { id: 'user456' };
    jest.spyOn(jwtService, 'verify').mockReturnValue(payload);

    const result = guard.canActivate(mockContext);
    expect(result).toBe(true);
    expect(mockRequest.userId).toBe(payload.id);
  });

  it('should extract token from Authorization header', () => {
    const token = 'header-token';
    mockRequest.headers = { authorization: `Bearer ${token}` };

    const payload = { id: 'user789' };
    jest.spyOn(jwtService, 'verify').mockReturnValue(payload);

    const result = guard.canActivate(mockContext);
    expect(result).toBe(true);
    expect(mockRequest.userId).toBe(payload.id);
  });

  it('should throw UnauthorizedException if token is invalid', () => {
    const token = 'bad-token';
    mockRequest.headers = { authorization: `Bearer ${token}` };

    jest.spyOn(jwtService, 'verify').mockImplementation(() => {
      throw new Error('invalid');
    });

    expect(() => guard.canActivate(mockContext)).toThrow(
      new UnauthorizedException('Invalid or expired token'),
    );
  });

  it('should return null if Authorization header is malformed', () => {
    mockRequest.headers = { authorization: 'BadHeader' };

    expect(() => guard.canActivate(mockContext)).toThrow(
      new UnauthorizedException('No token provided'),
    );
  });
});
