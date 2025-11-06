import { QueryHandler } from '@nestjs/cqrs';
import { TeamRole } from 'src/team/domain/types/team.types';
import { GetRoleByTeamIdQuery } from 'src/user/application/queries/get-role-by-team-id.query';
import { UserRepository } from 'src/user/infrastructure/persistence/user.repository';

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
