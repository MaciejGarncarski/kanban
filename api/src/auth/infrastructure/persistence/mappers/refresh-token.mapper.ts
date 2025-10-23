import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { RefreshTokenEntity } from 'src/auth/domain/refresh-token.entity';
import { refreshTokens } from 'src/db/schema';

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
