import { Module } from '@nestjs/common';
import { CreateBoardHandler } from 'src/board/application/commands/handlers/create-board.handler';
import { DeleteBoardHandler } from 'src/board/application/commands/handlers/delete-board.handler';
import { UpdateBoardHandler } from 'src/board/application/commands/handlers/update-board.handler';
import { GetBoardByIdHandler } from 'src/board/application/queries/handlers/get-board-by-id.handler';
import { GetBoardsByTeamHandler } from 'src/board/application/queries/handlers/get-boards-by-team.handler';
import { BoardController } from 'src/board/infrastructure/controllers/board.controller';
import { BoardRepository } from 'src/board/infrastructure/persistence/board.repository';
import { ProfanityCheckService } from 'src/infrastructure/services/profanity-check.service';
import { UserRepository } from 'src/user/infrastructure/persistence/user.repository';

const CommandHandlers = [
  DeleteBoardHandler,
  CreateBoardHandler,
  UpdateBoardHandler,
];
const QueryHandlers = [GetBoardsByTeamHandler, GetBoardByIdHandler];
const Repositories = [BoardRepository, UserRepository];

@Module({
  controllers: [BoardController],
  providers: [
    ...QueryHandlers,
    ...CommandHandlers,
    ...Repositories,
    ProfanityCheckService,
  ],
})
export class BoardModule {}
