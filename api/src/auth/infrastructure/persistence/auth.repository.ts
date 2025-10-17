import { Injectable } from '@nestjs/common';
import { AuthRepositoryPort } from 'src/auth/application/ports/auth.repository.port';
import { type DB } from 'src/db/client';
import { InjectDb } from 'src/db/db.provider';
import { users } from 'src/db/schema';

@Injectable()
export class AuthRepository implements AuthRepositoryPort {
  constructor(@InjectDb() private readonly db: DB) {}

  async register() {
    await this.db
      .insert(users)
      .values({ email: 'test', name: 'test', password_hash: 'test' });

    return true;
  }
}
