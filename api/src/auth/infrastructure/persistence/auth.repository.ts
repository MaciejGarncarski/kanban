import { Injectable } from '@nestjs/common';
import { AuthRepositoryInterface } from 'src/auth/domain/ports/auth.interface';
import { type DB } from 'src/infrastructure/persistence/db/client';
import { InjectDb } from 'src/infrastructure/persistence/db/db.provider';
import { users } from 'src/infrastructure/persistence/db/schema';

@Injectable()
export class AuthRepository implements AuthRepositoryInterface {
  constructor(@InjectDb() private readonly db: DB) {}

  async register() {
    await this.db
      .insert(users)
      .values({ email: 'test', name: 'test', password_hash: 'test' });

    return true;
  }
}
