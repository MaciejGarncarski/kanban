import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { plainToInstance } from 'class-transformer';
import { GetTeamsResponseDto } from 'src/teams/application/dtos/get-teams.response.dto';
import { GetTeamsQuery } from 'src/teams/application/queries/get-teams.query';
import { TeamsRepository } from 'src/teams/infrastructure/persistence/teams.repository';

@QueryHandler(GetTeamsQuery)
export class GetTeamsHandler implements IQueryHandler<GetTeamsQuery> {
  constructor(private readonly teamsRepository: TeamsRepository) {}

  async execute(query: GetTeamsQuery) {
    const teams = await this.teamsRepository.getUserTeams(query.userId);

    return plainToInstance(GetTeamsResponseDto, teams, {
      excludeExtraneousValues: true,
    });
  }
}
