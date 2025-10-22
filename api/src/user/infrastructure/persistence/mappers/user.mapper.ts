import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { users } from 'src/db/schema';
import { User } from 'src/user/domain/user.entity';

export type UserRecord = InferSelectModel<typeof users>;
export type NewUserRecord = InferInsertModel<typeof users>;

export class UserMapper {
  static toDomain(record: UserRecord): User {
    const user = new User({
      id: record.id,
      name: record.name,
      email: record.email,
      passwordHash: record.password_hash,
      createdAt: new Date(record.created_at),
    });

    return user;
  }

  static toPersistence(user: User): NewUserRecord {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      password_hash: user.getPasswordHash(),
      created_at: user.createdAt.toISOString(),
    };
  }
}
