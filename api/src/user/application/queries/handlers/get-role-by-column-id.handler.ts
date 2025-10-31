import { QueryHandler } from '@nestjs/cqrs';
import { TeamRole } from 'src/team/domain/types/team.types';
import { GetRoleByColumnIdQuery } from 'src/user/application/queries/get-role-by-column-id.query';
import { UserRepository } from 'src/user/infrastructure/persistence/user.repository';

@QueryHandler(GetRoleByColumnIdQuery)
export class GetRoleByColumnIdHandler {
  constructor(private readonly userRespo: UserRepository) {}

  async execute(query: GetRoleByColumnIdQuery): Promise<TeamRole> {
    const { columnId, userId } = query;

    const role = await this.userRespo.getUserRoleByColumnId(columnId, userId);

    return role;
  }
}
