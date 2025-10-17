import { Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { type DB } from 'src/db/client';
import { InjectDb } from 'src/db/db.provider';
import { users } from 'src/db/schema';
import { UserRepositoryPort } from 'src/user/application/ports/user.repository.port';

@Injectable()
export class UserRepository implements UserRepositoryPort {
  constructor(@InjectDb() private readonly db: DB) {}

  async find(id: string) {
    const [user] = await this.db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        created_at: users.created_at,
      })
      .from(users)
      .where(eq(users.id, id));

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string) {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async all() {
    return this.db.select().from(users);
  }

  async lastTen() {
    return this.db.select().from(users).limit(10);
  }

  async create(data: typeof users.$inferInsert) {
    const [createdUser] = await this.db.insert(users).values(data).returning();

    return createdUser;
  }
}
