import { REFRESH_TOKEN_MAX_AGE } from 'src/shared/constants/cookie.const';
import { v7 } from 'uuid';

export class RefreshTokenEntity {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly expiresAt: Date,
    public revoked: boolean,
  ) {}

  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  revoke() {
    this.revoked = true;
  }

  static createNew(userId: string): RefreshTokenEntity {
    const id = v7();

    return new RefreshTokenEntity(
      id,
      userId,
      new Date(Date.now() + REFRESH_TOKEN_MAX_AGE),
      false,
    );
  }
}
