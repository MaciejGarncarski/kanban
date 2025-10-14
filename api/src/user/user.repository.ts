import { Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { type DB } from 'src/db/client';
import { InjectDb } from 'src/db/db.provider';
import { users } from 'src/db/schema';

@Injectable()
export class UserRepository {
  constructor(@InjectDb() private readonly db: DB) {}

  /**
   * Find a user by their id
   * @param id the id of the user to find
   * @returns user the full user object
   * @throws 404 if a user with the given id is not found
   */
  async find(id: string) {
    const [user] = await this.db.select().from(users).where(eq(users.id, id));

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

  /**
   * Find all users in the database
   */
  async all() {
    return this.db.select().from(users);
  }

  /**
   * Find last 10 users
   */
  async lastTen() {
    return this.db.select().from(users).limit(10);
  }

  /**
   * Create a user
   * @params user - the name and email of the user to create
   */
  async create(data: typeof users.$inferInsert) {
    const [createdUser] = await this.db.insert(users).values(data).returning();

    return createdUser;
  }
}
