import { CommandHandler, EventBus } from '@nestjs/cqrs';
import { DeleteColumnCommand } from '../delete-columnd.command.js';
import { ColumnRepository } from '../../../infrastructure/persistence/column.repository.js';
import { SendToTeamMembersEvent } from '../../../../notifications/application/events/send-to-team-members.event.js';

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
