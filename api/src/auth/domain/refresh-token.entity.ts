import { REFRESH_TOKEN_MAX_AGE } from 'src/shared/constants/cookie.const';

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
    const id = crypto.randomUUID();

    return new RefreshTokenEntity(
      id,
      userId,
      new Date(Date.now() + REFRESH_TOKEN_MAX_AGE),
      false,
    );
  }
}
