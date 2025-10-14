import { Injectable } from '@nestjs/common';
import { AuthRepository } from 'src/auth/application/ports/auth.repository';
import { type DB } from 'src/db/client';
import { InjectDb } from 'src/db/db.provider';
import { users } from 'src/db/schema';

@Injectable()
export class AuthRepositoryImpl implements AuthRepository {
  constructor(@InjectDb() private readonly db: DB) {}

  async register() {
    await this.db
      .insert(users)
      .values({ email: 'test', name: 'test', password_hash: 'test' });

    return true;
  }
}
