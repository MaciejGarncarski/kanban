import { QueryHandler } from '@nestjs/cqrs';
import { TeamRole } from '../../../../team/domain/types/team.types.js';
import { GetRoleByBoardIdQuery } from '../get-role-by-board-id.query.js';
import { UserRepository } from '../../../infrastructure/persistence/user.repository.js';

@QueryHandler(GetRoleByBoardIdQuery)
export class GetRoleByBoardIdHandler {
  constructor(private readonly userRepo: UserRepository) {}

  async execute(query: GetRoleByBoardIdQuery): Promise<TeamRole> {
    const { readableBoardId, userId } = query;

    const role = await this.userRepo.getUserRoleByBoardId(
      readableBoardId,
      userId,
    );

    return role;
  }
}
