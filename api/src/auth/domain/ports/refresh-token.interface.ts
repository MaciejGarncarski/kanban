import { RefreshTokenEntity } from '../refresh-token.entity.js';

export interface RefreshTokenRepositoryInterface {
  create(
    userId: string,
    refreshTokenPlain: string,
    expiresAt: Date,
  ): Promise<CreateRefreshTokenReturn>;
  findActiveByToken(
    refreshTokenPlain: string,
  ): Promise<RefreshTokenEntity | null>;
  revoke(tokenId: string): Promise<void>;
  rotate(
    refreshToken: RefreshTokenEntity,
    newRefreshTokenPlain: string,
    expiresAt: Date,
  ): Promise<CreateRefreshTokenReturn>;
}

type CreateRefreshTokenReturn = {
  tokenPlain: string;
  tokenHash: string;
  entity: RefreshTokenEntity;
};
