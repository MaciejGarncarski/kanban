import { RefreshTokenEntity } from 'src/auth/domain/refresh-token.entity';
import { REFRESH_TOKEN_MAX_AGE } from 'src/shared/constants/cookie.const';

jest.mock('src/shared/constants/cookie.const', () => ({
  REFRESH_TOKEN_MAX_AGE: 1000 * 60 * 60, // 1 hour
}));

describe('RefreshToken', () => {
  it('should correctly identify expired tokens', () => {
    const past = new Date(Date.now() - 1000);
    const token = new RefreshTokenEntity('id1', 'user1', past, false);
    expect(token.isExpired()).toBe(true);
  });

  it('should correctly identify non-expired tokens', () => {
    const future = new Date(Date.now() + 1000 * 60);
    const token = new RefreshTokenEntity('id2', 'user2', future, false);
    expect(token.isExpired()).toBe(false);
  });

  it('should revoke the token', () => {
    const future = new Date(Date.now() + 1000 * 60);
    const token = new RefreshTokenEntity('id3', 'user3', future, false);
    token.revoke();
    expect(token.revoked).toBe(true);
  });

  it('should create a new refresh token with correct properties', () => {
    const userId = 'user4';
    const token = RefreshTokenEntity.createNew(userId);

    expect(token).toBeInstanceOf(RefreshTokenEntity);
    expect(token.userId).toBe(userId);
    expect(token.revoked).toBe(false);
    expect(token.expiresAt.getTime()).toBeGreaterThan(Date.now());
    expect(token.expiresAt.getTime()).toBeLessThanOrEqual(
      Date.now() + REFRESH_TOKEN_MAX_AGE + 1000, // Allow 1 second margin
    );
  });
});
