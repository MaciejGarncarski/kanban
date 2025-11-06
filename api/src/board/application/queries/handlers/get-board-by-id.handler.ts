import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { BoardRepository } from 'src/board/infrastructure/persistence/board.repository';
import { GetBoardByIdQuery } from 'src/board/application/queries/get-board-by-id.query';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { BoardDetailDto } from 'src/board/application/dtos/board-detail.dto';

@QueryHandler(GetBoardByIdQuery)
export class GetBoardByIdHandler implements IQueryHandler<GetBoardByIdQuery> {
  constructor(private readonly boardRepo: BoardRepository) {}

  async execute(query: GetBoardByIdQuery): Promise<BoardDetailDto> {
    const board = await this.boardRepo.findById(query.readableBoardId);

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    const dto = plainToInstance(BoardDetailDto, instanceToPlain(board), {
      excludeExtraneousValues: true,
    });

    return dto;
  }
}
