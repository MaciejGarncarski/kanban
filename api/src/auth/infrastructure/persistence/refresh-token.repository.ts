import { Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { RefreshTokenRepositoryInterface } from '../../domain/ports/refresh-token.interface.js';
import { RefreshTokenEntity } from '../../domain/refresh-token.entity.js';
import { refreshTokens } from '../../../infrastructure/persistence/db/schema.js';
import { sha256 } from '../../../shared/utils/sha256.utils.js';
import { RefreshTokenMapper } from './mappers/refresh-token.mapper.js';
import { randomBytes } from 'crypto';
import { type DB } from '../../../infrastructure/persistence/db/client.js';
import { InjectDb } from '../../../infrastructure/persistence/db/db.provider.js';

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
