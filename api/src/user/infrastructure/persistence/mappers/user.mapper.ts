import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { users } from '../../../../infrastructure/persistence/db/schema.js';
import { UserEntity } from '../../../domain/user.entity.js';

export type UserRecord = InferSelectModel<typeof users>;
export type NewUserRecord = InferInsertModel<typeof users>;

export class UserMapper {
  static toDomain(record: UserRecord): UserEntity {
    const user = new UserEntity({
      id: record.id,
      name: record.name,
      email: record.email,
      passwordHash: record.password_hash,
      createdAt: new Date(record.created_at),
    });

    return user;
  }

  static toPersistence(user: UserEntity): NewUserRecord {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      password_hash: user.getPasswordHash(),
      created_at: user.createdAt.toISOString(),
    };
  }
}
