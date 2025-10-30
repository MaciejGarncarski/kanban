import { QueryHandler } from '@nestjs/cqrs';
import { TeamRole } from 'src/team/domain/types/team.types';
import { GetRoleByTeamIdQuery } from 'src/user/application/queries/get-role-by-team-id.query';
import { UserRepository } from 'src/user/infrastructure/persistence/user.repository';

@QueryHandler(GetRoleByTeamIdQuery)
export class GetRoleByTeamIdHandler {
  constructor(private readonly userRespo: UserRepository) {}

  async execute(query: GetRoleByTeamIdQuery): Promise<TeamRole> {
    const { teamId, userId } = query;

    const role = await this.userRespo.getUserRoleByTeamId(teamId, userId);

    return role;
  }
}
