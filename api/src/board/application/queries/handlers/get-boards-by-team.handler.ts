import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { UnauthorizedException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { GetBoardsByTeamQuery } from 'src/board/application/queries/get-boards-by-team.query';
import { BoardRepository } from 'src/board/infrastructure/persistence/board.repository';
import { GetBoardsByTeamResponseDto } from 'src/board/application/dtos/get-boards-by-team.response.dto';

@QueryHandler(GetBoardsByTeamQuery)
export class GetBoardsByTeamHandler
  implements IQueryHandler<GetBoardsByTeamQuery>
{
  constructor(private readonly boardRepo: BoardRepository) {}

  async execute(query: GetBoardsByTeamQuery) {
    const boards = await this.boardRepo.findByTeamId(query.teamId);

    if (!boards) {
      throw new UnauthorizedException('Boards not found');
    }

    return plainToInstance(
      GetBoardsByTeamResponseDto,
      { boards },
      {
        excludeExtraneousValues: true,
      },
    );
  }
}
