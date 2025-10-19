import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { RefreshTokenRepositoryPort } from 'src/auth/application/ports/refresh-token.repository.port';
import { RefreshToken } from 'src/auth/domain/refresh-token.entity';
import { REFRESH_TOKEN_MAX_AGE } from 'src/shared/constants/cookie.const';
import { sha256 } from 'src/shared/utils/sha256.utils';

interface StoredToken {
  record: RefreshToken;
  tokenHash: string;
  replacedBy?: string;
}

@Injectable()
export class InMemoryRefreshTokenRepository
  implements RefreshTokenRepositoryPort
{
  private tokens: StoredToken[] = [];

  async create(
    userId: string,
    plainToken: string,
    expiresAt: Date,
  ): Promise<RefreshToken> {
    const token = new RefreshToken(randomUUID(), userId, expiresAt, false);
    const tokenHash = sha256(plainToken);

    this.tokens.push({ record: token, tokenHash });
    return token;
  }

  async findActiveByToken(
    refreshTokenPlain: string,
  ): Promise<RefreshToken | null> {
    const tokenHash = sha256(refreshTokenPlain);

    const stored = this.tokens.find(
      (t) => !t.record.revoked && t.tokenHash === tokenHash,
    );

    if (!stored) return null;
    return stored.record;
  }

  async revoke(tokenId: string, replacedBy?: string): Promise<void> {
    const stored = this.tokens.find((t) => t.record.id === tokenId);
    if (stored) {
      stored.record.revoke();
      if (replacedBy) stored.replacedBy = replacedBy;
    }
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

  getAll(): RefreshToken[] {
    return this.tokens.map((t) => t.record);
  }

  clear(): void {
    this.tokens = [];
  }
}
