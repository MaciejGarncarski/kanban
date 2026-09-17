import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetBoardsByTeamQuery } from '../get-boards-by-team.query.js';
import { BoardRepository } from '../../../infrastructure/persistence/board.repository.js';
import {
  GetBoardsByTeamResponseDto,
  getBoardsByTeamResponseSchema,
} from '../../dtos/get-boards-by-team.response.dto.js';
import { parseResponse } from '../../../../infrastructure/validation/parse-response.js';

@QueryHandler(GetBoardsByTeamQuery)
export class GetBoardsByTeamHandler implements IQueryHandler<GetBoardsByTeamQuery> {
  constructor(private readonly boardRepo: BoardRepository) {}

  async execute(query: GetBoardsByTeamQuery) {
    const boards = await this.boardRepo.findByTeamId(
      query.userId,
      query.readableTeamId,
    );

    return parseResponse<GetBoardsByTeamResponseDto>(
      getBoardsByTeamResponseSchema,
      { boards },
    );
  }
}
