import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { users } from 'src/db/schema';
import { User } from 'src/user/domain/user.entity';

export type UserRecord = InferSelectModel<typeof users>;
export type NewUserRecord = InferInsertModel<typeof users>;

export class UserMapper {
  static toDomain(user: UserRecord): User {
    return new User({
      name: user.name,
      email: user.email,
      passwordHash: user.password_hash,
      id: user.id,
    });
  }

  static toPersistence(user: User): NewUserRecord {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      password_hash: user.getHashedPassword(),
    };
  }
}
