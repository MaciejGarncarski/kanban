import { Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { RefreshTokenRepositoryInterface } from 'src/auth/domain/ports/refresh-token.interface';
import { RefreshTokenEntity } from 'src/auth/domain/refresh-token.entity';
import { refreshTokens } from 'src/infrastructure/persistence/db/schema';
import { sha256 } from 'src/shared/utils/sha256.utils';
import { RefreshTokenMapper } from 'src/auth/infrastructure/persistence/mappers/refresh-token.mapper';
import { randomBytes } from 'crypto';
import { type DB } from 'src/infrastructure/persistence/db/client';
import { InjectDb } from 'src/infrastructure/persistence/db/db.provider';

@Injectable()
export class RefreshTokenRepository implements RefreshTokenRepositoryInterface {
  constructor(@InjectDb() private readonly db: DB) {}

  async create(userId: string) {
    const newRefreshTokenPlain = randomBytes(32).toString('hex');
    const tokenHash = sha256(newRefreshTokenPlain);
    const tokenEntity = RefreshTokenEntity.createNew(userId);
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
  ): Promise<RefreshTokenEntity | null> {
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

  async rotate(refreshToken: RefreshTokenEntity) {
    const created = await this.create(refreshToken.userId);

    await this.revoke(refreshToken.id, created.entity.id);
    return {
      tokenPlain: created.tokenPlain,
      tokenHash: created.tokenHash,
      entity: created.entity,
    };
  }
}
