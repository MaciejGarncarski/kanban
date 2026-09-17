import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { sha256 } from '../../../../../shared/utils/sha256.utils.js';
import { RefreshTokenRepositoryInterface } from '../../../../domain/ports/refresh-token.interface.js';
import { RefreshTokenEntity } from '../../../../domain/refresh-token.entity.js';

interface StoredToken {
  entity: RefreshTokenEntity;
  tokenHash: string;
  replacedBy?: string;
}

@Injectable()
export class InMemoryRefreshTokenRepository implements RefreshTokenRepositoryInterface {
  private tokens: StoredToken[] = [];

  async create(userId: string, customToken?: string) {
    const tokenPlain = customToken ?? randomBytes(32).toString('hex');
    const tokenHash = sha256(tokenPlain);

    const tokenEntity = RefreshTokenEntity.createNew(userId);
    this.tokens.push({ entity: tokenEntity, tokenHash });

    return {
      tokenPlain,
      tokenHash,
      entity: tokenEntity,
    };
  }

  async findActiveByToken(
    tokenPlain: string,
  ): Promise<RefreshTokenEntity | null> {
    const tokenHash = sha256(tokenPlain);

    const stored = this.tokens.find(
      (t) => !t.entity.revoked && t.tokenHash === tokenHash,
    );

    return stored ? stored.entity : null;
  }

  async revoke(tokenId: string, replacedBy?: string): Promise<void> {
    const stored = this.tokens.find((t) => t.entity.id === tokenId);
    if (stored) {
      stored.entity.revoke();
      stored.replacedBy = replacedBy;
    }
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

  getAll(): RefreshTokenEntity[] {
    return this.tokens.map((t) => t.entity);
  }

  clear(): void {
    this.tokens = [];
  }
}
