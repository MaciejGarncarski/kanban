import { TeamRole } from '../../../team/domain/types/team.types.js';
import { UserEntity } from '../user.entity.js';
import { NewUserRecord } from '../../infrastructure/persistence/mappers/user.mapper.js';

export interface UserRepositoryInterface {
  find(id: string): Promise<UserEntity | null>;
  findAll(): Promise<UserEntity[]>;
  findByEmail(email: string): Promise<UserEntity | null>;
  findAllByTeamId(teamId: string): Promise<UserEntity[]>;
  all(): Promise<UserEntity[]>;
  create(data: NewUserRecord): Promise<UserEntity>;
  findAllByBoardId(boardId: string): Promise<UserEntity[]>;
  isUserInTeamByColumn(userId: string, columnId: string): Promise<boolean>;
  isUserInTeamByBoard(
    userId: string,
    readableBoardId: string,
  ): Promise<boolean>;
  isUserInTeamByTeam(userId: string, teamId: string): Promise<boolean>;
  getUserRoleByColumnId(columnId: string, userId: string): Promise<TeamRole>;
  getUserRoleByTeamId(teamUUID: string, userId: string): Promise<TeamRole>;
  getUserRolebyReadableTeamId(
    readableTeamId: string,
    userId: string,
  ): Promise<TeamRole>;
  getUserRoleByBoardId(boardId: string, userId: string): Promise<TeamRole>;
}
