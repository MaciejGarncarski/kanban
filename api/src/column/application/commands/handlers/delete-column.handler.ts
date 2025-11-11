import { CommandHandler, EventBus } from '@nestjs/cqrs';
import { DeleteColumnCommand } from 'src/column/application/commands/delete-columnd.command';
import { ColumnRepository } from 'src/column/infrastructure/persistence/column.repository';
import { SendToTeamMembersEvent } from 'src/notifications/application/events/send-to-team-members.event';

@CommandHandler(DeleteColumnCommand)
export class DeleteColumnHandler {
  constructor(
    private readonly columnRepo: ColumnRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: DeleteColumnCommand): Promise<void> {
    const { columnId } = command;

    const readableTeamId =
      await this.columnRepo.findReadableTeamIdByColumnId(columnId);

    await this.columnRepo.delete(columnId);
    this.eventBus.publish(new SendToTeamMembersEvent(readableTeamId));
  }
}
