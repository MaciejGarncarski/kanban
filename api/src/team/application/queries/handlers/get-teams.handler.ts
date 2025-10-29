import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { plainToInstance } from 'class-transformer';
import { GetTeamsResponseDto } from 'src/team/application/dtos/get-teams.response.dto';
import { GetTeamsQuery } from 'src/team/application/queries/get-teams.query';
import { TeamRepository } from 'src/team/infrastructure/persistence/team.repository';

@QueryHandler(GetTeamsQuery)
export class GetTeamsHandler implements IQueryHandler<GetTeamsQuery> {
  constructor(private readonly teamRepository: TeamRepository) {}

  async execute(query: GetTeamsQuery) {
    const teams = await this.teamRepository.getUserTeams(query.userId);

    return plainToInstance(GetTeamsResponseDto, teams, {
      excludeExtraneousValues: true,
    });
  }
}
