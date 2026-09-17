import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import {
  GetTeamsResponseDto,
  getTeamsResponseSchema,
} from '../../dtos/get-teams.response.dto.js';
import { parseResponse } from '../../../../infrastructure/validation/parse-response.js';
import { GetTeamsQuery } from '../get-teams.query.js';
import { TeamRepository } from '../../../infrastructure/persistence/team.repository.js';

@QueryHandler(GetTeamsQuery)
export class GetTeamsHandler implements IQueryHandler<GetTeamsQuery> {
  constructor(private readonly teamRepository: TeamRepository) {}

  async execute(query: GetTeamsQuery) {
    const teams = await this.teamRepository.getUserTeams(query.userId);

    return parseResponse<GetTeamsResponseDto>(getTeamsResponseSchema, teams);
  }
}
