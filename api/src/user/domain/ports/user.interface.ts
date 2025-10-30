import { UserEntity } from 'src/user/domain/user.entity';
import { NewUserRecord } from 'src/user/infrastructure/persistence/mappers/user.mapper';

export interface UserRepositoryInterface {
  find(id: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  all(): Promise<UserEntity[]>;
  lastTen(): Promise<UserEntity[]>;
  create(data: NewUserRecord): Promise<UserEntity>;
  findAllByBoardId(boardId: string): Promise<UserEntity[]>;
  isUserInTeamByColumn(userId: string, columnId: string): Promise<boolean>;
  isUserInTeamByBoard(userId: string, boardId: string): Promise<boolean>;
}
