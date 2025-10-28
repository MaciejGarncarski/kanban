import { hash, verify } from '@node-rs/argon2';
import { v7 } from 'uuid';

export interface UserProps {
  id?: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt?: Date;
}

export class UserEntity {
  readonly id: string;
  readonly name: string;
  readonly email: string;

  private readonly passwordHash: string;
  readonly createdAt: Date;

  constructor(props: UserProps) {
    this.id = props.id ?? v7();
    this.name = props.name;
    this.email = props.email.toLowerCase();
    this.passwordHash = props.passwordHash;
    this.createdAt = props.createdAt ?? new Date();
  }

  static async createNew(
    name: string,
    email: string,
    plainPassword: string,
  ): Promise<UserEntity> {
    const passwordHash = await hash(plainPassword);
    return new UserEntity({ name, email, passwordHash });
  }

  async checkPassword(plainPassword: string): Promise<boolean> {
    return verify(this.passwordHash, plainPassword);
  }

  getPasswordHash(): string {
    return this.passwordHash;
  }
}
