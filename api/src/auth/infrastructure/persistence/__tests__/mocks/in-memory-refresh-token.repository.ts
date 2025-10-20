import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { sha256 } from 'src/shared/utils/sha256.utils';
import { RefreshTokenRepositoryPort } from 'src/auth/application/ports/refresh-token.repository.port';
import { RefreshToken } from 'src/auth/domain/refresh-token.entity';
import {
  RefreshTokenMapper,
  RefreshTokenRecord,
} from 'src/auth/infrastructure/persistence/mappers/refresh-token.mapper';

interface StoredToken {
  entity: RefreshToken;
  tokenHash: string;
  replacedBy?: string;
}

@Injectable()
export class InMemoryRefreshTokenRepository
  implements RefreshTokenRepositoryPort
{
  private tokens: StoredToken[] = [];

  async create(userId: string, customToken?: string) {
    const tokenPlain = customToken ?? randomBytes(32).toString('hex');
    const tokenHash = sha256(tokenPlain);

    const tokenEntity = RefreshToken.createNew(userId);
    const tokenPersistence = RefreshTokenMapper.toPersistence(
      tokenEntity,
      tokenHash,
    ) as RefreshTokenRecord;
    const tokenDomain = RefreshTokenMapper.toDomain(tokenPersistence);

    this.tokens.push({ entity: tokenDomain, tokenHash });

    return {
      tokenPlain,
      tokenHash,
      entity: tokenDomain,
    };
  }

  async findActiveByToken(tokenPlain: string): Promise<RefreshToken | null> {
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

  async rotate(refreshToken: RefreshToken): Promise<RefreshToken> {
    const created = await this.create(refreshToken.userId);
    await this.revoke(refreshToken.id, created.entity.id);
    return created.entity;
  }

  getAll(): RefreshToken[] {
    return this.tokens.map((t) => t.entity);
  }

  clear(): void {
    this.tokens = [];
  }
}
