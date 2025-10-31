import { CommandHandler } from '@nestjs/cqrs';
import { DeleteColumnCommand } from 'src/column/application/commands/delete-columnd.command';
import { ColumnRepository } from 'src/column/infrastructure/persistence/column.repository';

@CommandHandler(DeleteColumnCommand)
export class DeleteColumnHandler {
  constructor(private readonly columnRepo: ColumnRepository) {}

  async execute(command: DeleteColumnCommand): Promise<void> {
    const { columnId } = command;

    await this.columnRepo.delete(columnId);
  }
}
