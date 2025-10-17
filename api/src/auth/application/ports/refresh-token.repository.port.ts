import { RefreshToken } from 'src/auth/domain/refresh-token.entity';

export interface RefreshTokenRepositoryPort {
  create(
    userId: string,
    refreshTokenPlain: string,
    expiresAt: Date,
  ): Promise<RefreshToken>;
  findActiveByToken(refreshTokenPlain: string): Promise<RefreshToken | null>;
  revoke(tokenId: string): Promise<void>;
  rotate(
    tokenRecord: RefreshToken,
    newRefreshTokenPlain: string,
    expiresAt: Date,
  ): Promise<RefreshToken>;
}
