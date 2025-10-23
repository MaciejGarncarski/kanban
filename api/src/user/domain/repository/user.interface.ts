import { UserEntity } from 'src/user/domain/user.entity';
import { NewUserRecord } from 'src/user/infrastructure/persistence/mappers/user.mapper';

export interface UserRepositoryInterface {
  find(id: string): Promise<UserEntity>;
  findByEmail(email: string): Promise<UserEntity>;
  all(): Promise<UserEntity[]>;
  lastTen(): Promise<UserEntity[]>;
  create(data: NewUserRecord): Promise<UserEntity>;
}
