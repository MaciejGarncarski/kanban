import { Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { RefreshTokenRepositoryInterface } from 'src/auth/domain/repository/refresh-token.interface';
import { RefreshToken } from 'src/auth/domain/refresh-token.entity';
import { type DB } from 'src/db/client';
import { InjectDb } from 'src/db/db.provider';
import { refreshTokens } from 'src/db/schema';
import { sha256 } from 'src/shared/utils/sha256.utils';
import { RefreshTokenMapper } from 'src/auth/infrastructure/persistence/mappers/refresh-token.mapper';
import { randomBytes } from 'crypto';

@Injectable()
export class RefreshTokenRepository implements RefreshTokenRepositoryInterface {
  constructor(@InjectDb() private readonly db: DB) {}

  async create(userId: string) {
    const newRefreshTokenPlain = randomBytes(32).toString('hex');
    const tokenHash = sha256(newRefreshTokenPlain);
    const tokenEntity = RefreshToken.createNew(userId);
    const tokenPersistence = RefreshTokenMapper.toPersistence(
      tokenEntity,
      tokenHash,
    );

    const [row] = await this.db
      .insert(refreshTokens)
      .values(tokenPersistence)
      .returning();

    return {
      tokenPlain: newRefreshTokenPlain,
      tokenHash: tokenHash,
      entity: RefreshTokenMapper.toDomain(row),
    };
  }

  async findActiveByToken(
    refreshTokenPlain: string,
  ): Promise<RefreshToken | null> {
    const tokenHash = sha256(refreshTokenPlain);

    const [row] = await this.db
      .select()
      .from(refreshTokens)
      .where(
        and(
          eq(refreshTokens.revoked, false),
          eq(refreshTokens.tokenHash, tokenHash),
        ),
      );

    if (!row) return null;

    return RefreshTokenMapper.toDomain(row);
  }

  async revoke(tokenId: string, replacedBy?: string): Promise<void> {
    await this.db
      .update(refreshTokens)
      .set({ revoked: true, replacedBy: replacedBy })
      .where(eq(refreshTokens.id, tokenId));
  }

  async rotate(refreshToken: RefreshToken): Promise<RefreshToken> {
    const created = await this.create(refreshToken.userId);

    await this.revoke(refreshToken.id, created.entity.id);
    return created.entity;
  }
}
