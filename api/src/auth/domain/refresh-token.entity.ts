import { REFRESH_TOKEN_MAX_AGE } from 'src/shared/constants/cookie.const';

export class RefreshToken {
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

  static createNew(userId: string): RefreshToken {
    const id = crypto.randomUUID();

    return new RefreshToken(
      id,
      userId,
      new Date(Date.now() + REFRESH_TOKEN_MAX_AGE),
      false,
    );
  }
}
