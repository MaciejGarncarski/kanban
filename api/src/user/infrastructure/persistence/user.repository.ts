import { Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { type DB } from 'src/db/client';
import { InjectDb } from 'src/db/db.provider';
import { users } from 'src/db/schema';
import { UserRepositoryInterface } from 'src/user/domain/repository/user.interface';
import { UserMapper } from 'src/user/infrastructure/persistence/mappers/user.mapper';

@Injectable()
export class UserRepository implements UserRepositoryInterface {
  constructor(@InjectDb() private readonly db: DB) {}

  async find(id: string) {
    const [user] = await this.db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        created_at: users.created_at,
        password_hash: users.password_hash,
      })
      .from(users)
      .where(eq(users.id, id));

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return UserMapper.toDomain(user);
  }

  async findByEmail(email: string) {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()));

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return UserMapper.toDomain(user);
  }

  async all() {
    const allUsers = await this.db.select().from(users);
    return allUsers.map((user) => UserMapper.toDomain(user));
  }

  async lastTen() {
    const lastTenUsers = await this.db.select().from(users).limit(10);
    return lastTenUsers.map((user) => UserMapper.toDomain(user));
  }

  async create(data: typeof users.$inferInsert) {
    const [createdUser] = await this.db.insert(users).values(data).returning();

    return UserMapper.toDomain(createdUser);
  }
}
