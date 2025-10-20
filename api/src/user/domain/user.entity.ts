import { hash, verify } from '@node-rs/argon2';

export class User {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  private readonly passwordHash: string;
  readonly createdAt: Date;

  constructor(_props: {
    id?: string;
    name: string;
    email: string;
    passwordHash: string;
    createdAt?: Date;
  }) {
    this.id = _props.id ?? '';
    this.name = _props.name;
    this.email = _props.email;
    this.passwordHash = _props.passwordHash;
    this.createdAt = _props.createdAt ?? new Date();
  }

  async checkPassword(password: string): Promise<boolean> {
    return verify(this.passwordHash, password);
  }

  get createdAtForDb() {
    return this.createdAt.toISOString();
  }

  async createNew(password: string): Promise<User> {
    const passwordHash = await hash(password);
    return new User({
      name: this.name,
      email: this.email,
      passwordHash,
    });
  }

  getHashedPassword() {
    return this.passwordHash;
  }
}
