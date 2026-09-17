import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { RefreshTokenEntity } from '../../../domain/refresh-token.entity.js';
import { refreshTokens } from '../../../../infrastructure/persistence/db/schema.js';

export type RefreshTokenRecord = InferSelectModel<typeof refreshTokens>;
export type NewRefreshTokenRecord = InferInsertModel<typeof refreshTokens>;

export class RefreshTokenMapper {
  static toDomain(refreshToken: RefreshTokenRecord): RefreshTokenEntity {
    return new RefreshTokenEntity(
      refreshToken.id,
      refreshToken.userId,
      new Date(refreshToken.expiresAt),
      refreshToken.revoked,
    );
  }

  static toPersistence(
    token: RefreshTokenEntity,
    tokenHash: string,
  ): NewRefreshTokenRecord {
    return {
      id: token.id,
      userId: token.userId,
      tokenHash,
      expiresAt: token.expiresAt,
      revoked: token.revoked,
    };
  }
}
