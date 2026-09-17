import { QueryHandler } from '@nestjs/cqrs';
import { TeamRole } from '../../../../team/domain/types/team.types.js';
import { GetRoleByTeamIdQuery } from '../get-role-by-team-id.query.js';
import { UserRepository } from '../../../infrastructure/persistence/user.repository.js';

@QueryHandler(GetRoleByTeamIdQuery)
export class GetRoleByTeamIdHandler {
  constructor(private readonly userRepo: UserRepository) {}

  async execute(query: GetRoleByTeamIdQuery): Promise<TeamRole> {
    const { readableTeamId, userId } = query;

    const role = await this.userRepo.getUserRolebyReadableTeamId(
      readableTeamId,
      userId,
    );

    return role;
  }
}
