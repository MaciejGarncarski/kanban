import { Module } from '@nestjs/common';
import { GetBoardByIdHandler } from 'src/board/application/queries/handlers/get-board-by-id.handler';
import { GetBoardsByTeamHandler } from 'src/board/application/queries/handlers/get-boards-by-team.handler';
import { BoardController } from 'src/board/infrastructure/controllers/board.controller';
import { BoardRepository } from 'src/board/infrastructure/persistence/board.repository';

const CommandHandlers = [];
const QueryHandlers = [GetBoardsByTeamHandler, GetBoardByIdHandler];
const Repositories = [BoardRepository];

@Module({
  controllers: [BoardController],
  providers: [...QueryHandlers, ...CommandHandlers, ...Repositories],
})
export class BoardModule {}
