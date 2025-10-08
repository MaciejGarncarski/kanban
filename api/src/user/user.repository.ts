import { TransactionHost } from '@nestjs-cls/transactional';
import { Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DbTransactionAdapter } from 'src/db/client';
import { usersTable } from 'src/db/schema';

@Injectable()
export class UserRepository {
  constructor(private readonly txHost: TransactionHost<DbTransactionAdapter>) {}

  /**
   * Find a user by their id
   * @param id the id of the user to find
   * @returns user the full user object
   * @throws 404 if a user with the given id is not found
   */
  async find(id: number) {
    const [user] = await this.txHost.tx
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, id));

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  /**
   * Find all users in the database
   */
  async all() {
    return this.txHost.tx.select().from(usersTable);
  }

  /**
   * Create a user
   * @params user - the name and email of the user to create
   */
  //   async create(user: { name: string; email: string }) {
  //     const [createdUser] = await this.txHost.tx
  //       .insert(usersTable)
  //       .values(user)
  //       .returning();

  //     return createdUser;
  //   }
}
