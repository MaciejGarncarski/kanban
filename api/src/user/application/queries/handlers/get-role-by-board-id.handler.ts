import { QueryHandler } from '@nestjs/cqrs';
import { TeamRole } from 'src/team/domain/types/team.types';
import { GetRoleByBoardIdQuery } from 'src/user/application/queries/get-role-by-board-id.query';
import { UserRepository } from 'src/user/infrastructure/persistence/user.repository';

@QueryHandler(GetRoleByBoardIdQuery)
export class GetRoleByBoardIdHandler {
  constructor(private readonly userRepo: UserRepository) {}

  async execute(query: GetRoleByBoardIdQuery): Promise<TeamRole> {
    const { boardId, userId } = query;

    const role = await this.userRepo.getUserRoleByBoardId(boardId, userId);

    return role;
  }
}
