import { Module } from '@nestjs/common';
import { CreateColumnHandler } from 'src/column/application/commands/handlers/create-column.handler';
import { DeleteColumnHandler } from 'src/column/application/commands/handlers/delete-column.handler';
import { UpdateColumnHandler } from 'src/column/application/commands/handlers/update-column.handler';
import { ColumnController } from 'src/column/infrastructure/controllers/column.controller';
import { ColumnRepository } from 'src/column/infrastructure/persistence/column.repository';
import { GetRoleByBoardIdHandler } from 'src/user/application/queries/handlers/get-role-by-board-id.handler';
import { GetRoleByColumnIdHandler } from 'src/user/application/queries/handlers/get-role-by-column-id.handler';
import { GetRoleByTeamIdHandler } from 'src/user/application/queries/handlers/get-role-by-team-id.handler';
import { UserRepository } from 'src/user/infrastructure/persistence/user.repository';

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
  providers: [...QueryHandlers, ...CommandHandlers, ...Repositories],
})
export class ColumnModule {}
