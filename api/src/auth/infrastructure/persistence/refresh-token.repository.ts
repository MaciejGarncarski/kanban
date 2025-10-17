import { Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { RefreshTokenRepositoryPort } from 'src/auth/application/ports/refresh-token.repository.port';
import { RefreshToken } from 'src/auth/domain/refresh-token.entity';
import { REFRESH_TOKEN_MAX_AGE } from 'src/shared/constants/cookie.const';
import { type DB } from 'src/db/client';
import { InjectDb } from 'src/db/db.provider';
import { refreshTokens } from 'src/db/schema';
import { sha256 } from 'src/shared/utils/sha256.utils';

@Injectable()
export class RefreshTokenRepository implements RefreshTokenRepositoryPort {
  constructor(@InjectDb() private readonly db: DB) {}

  async create(
    userId: string,
    plainToken: string,
    expiresAt: Date,
  ): Promise<RefreshToken> {
    const tokenHash = sha256(plainToken);

    const [row] = await this.db
      .insert(refreshTokens)
      .values({ userId, tokenHash, expiresAt })
      .returning();

    return new RefreshToken(row.id, row.userId, row.expiresAt, row.revoked);
  }

  async findActiveByToken(
    refreshTokenPlain: string,
  ): Promise<RefreshToken | null> {
    const [row] = await this.db
      .select()
      .from(refreshTokens)
      .where(
        and(
          eq(refreshTokens.revoked, false),
          eq(refreshTokens.tokenHash, sha256(refreshTokenPlain)),
        ),
      );

    if (!row) return null;

    return new RefreshToken(row.id, row.userId, row.expiresAt, row.revoked);
  }

  async revoke(tokenId: string, replacedBy?: string): Promise<void> {
    await this.db
      .update(refreshTokens)
      .set({ revoked: true, replacedBy: replacedBy })
      .where(eq(refreshTokens.id, tokenId));
  }

  async rotate(
    tokenRecord: RefreshToken,
    newRefreshTokenPlain: string,
  ): Promise<RefreshToken> {
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_MAX_AGE);

    const created = await this.create(
      tokenRecord.userId,
      newRefreshTokenPlain,
      expiresAt,
    );

    await this.revoke(tokenRecord.id, created.id);
    return created;
  }
}
