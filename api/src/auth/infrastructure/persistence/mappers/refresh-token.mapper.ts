import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { RefreshToken } from 'src/auth/domain/refresh-token.entity';
import { refreshTokens } from 'src/db/schema';

export type RefreshTokenRecord = InferSelectModel<typeof refreshTokens>;
export type NewRefreshTokenRecord = InferInsertModel<typeof refreshTokens>;

export class RefreshTokenMapper {
  static toDomain(refreshToken: RefreshTokenRecord): RefreshToken {
    return new RefreshToken(
      refreshToken.id,
      refreshToken.userId,
      new Date(refreshToken.expiresAt),
      refreshToken.revoked,
    );
  }

  static toPersistence(
    token: RefreshToken,
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
