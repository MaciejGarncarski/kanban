import { Module } from '@nestjs/common';
import { CreateColumnHandler } from 'src/column/application/commands/handlers/create-column.handler';
import { ColumnController } from 'src/column/infrastructure/controllers/column.controller';
import { ColumnRepository } from 'src/column/infrastructure/persistence/column.repository';

const CommandHandlers = [CreateColumnHandler];
const QueryHandlers = [];
const Repositories = [ColumnRepository];

@Module({
  controllers: [ColumnController],
  providers: [...QueryHandlers, ...CommandHandlers, ...Repositories],
})
export class ColumnModule {}
