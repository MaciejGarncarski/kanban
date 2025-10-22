import { User } from 'src/user/domain/user.entity';
import { NewUserRecord } from 'src/user/infrastructure/persistence/mappers/user.mapper';

export interface UserRepositoryInterface {
  find(id: string): Promise<User>;
  findByEmail(email: string): Promise<User>;
  all(): Promise<User[]>;
  lastTen(): Promise<User[]>;
  create(data: NewUserRecord): Promise<User>;
}
