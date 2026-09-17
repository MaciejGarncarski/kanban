import { Module } from '@nestjs/common';
import { CreateBoardHandler } from './application/commands/handlers/create-board.handler.js';
import { DeleteBoardHandler } from './application/commands/handlers/delete-board.handler.js';
import { UpdateBoardHandler } from './application/commands/handlers/update-board.handler.js';
import { GetBoardByIdHandler } from './application/queries/handlers/get-board-by-id.handler.js';
import { GetBoardsByTeamHandler } from './application/queries/handlers/get-boards-by-team.handler.js';
import { BoardController } from './infrastructure/controllers/board.controller.js';
import { BoardRepository } from './infrastructure/persistence/board.repository.js';
import { ProfanityCheckService } from '../infrastructure/services/profanity-check.service.js';
import { UserRepository } from '../user/infrastructure/persistence/user.repository.js';

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
