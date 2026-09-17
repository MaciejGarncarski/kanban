import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { BoardRepository } from '../../../infrastructure/persistence/board.repository.js';
import { GetBoardByIdQuery } from '../get-board-by-id.query.js';
import {
  BoardDetailDto,
  boardDetailSchema,
} from '../../dtos/board-detail.dto.js';
import { parseResponse } from '../../../../infrastructure/validation/parse-response.js';

@QueryHandler(GetBoardByIdQuery)
export class GetBoardByIdHandler implements IQueryHandler<GetBoardByIdQuery> {
  constructor(private readonly boardRepo: BoardRepository) {}

  async execute(query: GetBoardByIdQuery): Promise<BoardDetailDto> {
    const board = await this.boardRepo.findById(
      query.userId,
      query.readableBoardId,
    );

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    const dto = parseResponse<BoardDetailDto>(boardDetailSchema, board);

    return dto;
  }
}
