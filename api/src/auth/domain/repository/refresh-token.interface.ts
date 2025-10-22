import { RefreshToken } from 'src/auth/domain/refresh-token.entity';

export interface RefreshTokenRepositoryInterface {
  create(
    userId: string,
    refreshTokenPlain: string,
    expiresAt: Date,
  ): Promise<CreateRefreshTokenReturn>;
  findActiveByToken(refreshTokenPlain: string): Promise<RefreshToken | null>;
  revoke(tokenId: string): Promise<void>;
  rotate(
    refreshToken: RefreshToken,
    newRefreshTokenPlain: string,
    expiresAt: Date,
  ): Promise<RefreshToken>;
}

type CreateRefreshTokenReturn = {
  tokenPlain: string;
  tokenHash: string;
  entity: RefreshToken;
};
