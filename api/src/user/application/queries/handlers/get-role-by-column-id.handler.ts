import { QueryHandler } from '@nestjs/cqrs';
import { TeamRole } from '../../../../team/domain/types/team.types.js';
import { GetRoleByColumnIdQuery } from '../get-role-by-column-id.query.js';
import { UserRepository } from '../../../infrastructure/persistence/user.repository.js';

@QueryHandler(GetRoleByColumnIdQuery)
export class GetRoleByColumnIdHandler {
  constructor(private readonly userRepo: UserRepository) {}

  async execute(query: GetRoleByColumnIdQuery): Promise<TeamRole> {
    const { columnId, userId } = query;

    const role = await this.userRepo.getUserRoleByColumnId(columnId, userId);

    return role;
  }
}
