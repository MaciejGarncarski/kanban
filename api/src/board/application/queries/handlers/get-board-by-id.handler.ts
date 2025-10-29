import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { UnauthorizedException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { BoardRepository } from 'src/board/infrastructure/persistence/board.repository';
import { GetBoardByIdQuery } from 'src/board/application/queries/get-board-by-id-query';
import { BoardDto } from 'src/board/application/dtos/board.dto';

@QueryHandler(GetBoardByIdQuery)
export class GetBoardByIdHandler implements IQueryHandler<GetBoardByIdQuery> {
  constructor(private readonly boardRepo: BoardRepository) {}

  async execute(query: GetBoardByIdQuery) {
    const board = await this.boardRepo.findById(query.boardId);

    if (!board) {
      throw new UnauthorizedException('Board not found');
    }

    return plainToInstance(BoardDto, board, {
      excludeExtraneousValues: true,
    });
  }
}
