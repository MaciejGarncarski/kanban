import { Module } from '@nestjs/common';
import { CreateColumnHandler } from './application/commands/handlers/create-column.handler.js';
import { DeleteColumnHandler } from './application/commands/handlers/delete-column.handler.js';
import { UpdateColumnHandler } from './application/commands/handlers/update-column.handler.js';
import { ColumnController } from './infrastructure/controllers/column.controller.js';
import { ColumnRepository } from './infrastructure/persistence/column.repository.js';
import { ProfanityCheckService } from '../infrastructure/services/profanity-check.service.js';
import { GetRoleByBoardIdHandler } from '../user/application/queries/handlers/get-role-by-board-id.handler.js';
import { GetRoleByColumnIdHandler } from '../user/application/queries/handlers/get-role-by-column-id.handler.js';
import { GetRoleByTeamIdHandler } from '../user/application/queries/handlers/get-role-by-team-id.handler.js';
import { UserRepository } from '../user/infrastructure/persistence/user.repository.js';

const CommandHandlers = [
  CreateColumnHandler,
  UpdateColumnHandler,
  DeleteColumnHandler,
];
const QueryHandlers = [
  GetRoleByColumnIdHandler,
  GetRoleByBoardIdHandler,
  GetRoleByTeamIdHandler,
];
const Repositories = [ColumnRepository, UserRepository];

@Module({
  controllers: [ColumnController],
  providers: [
    ...QueryHandlers,
    ...CommandHandlers,
    ...Repositories,
    ProfanityCheckService,
  ],
})
export class ColumnModule {}
