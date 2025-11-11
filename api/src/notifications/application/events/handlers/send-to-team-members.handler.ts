import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { SendToTeamMembersEvent } from 'src/notifications/application/events/send-to-team-members.event';
import { NotificationsService } from 'src/notifications/infrastructure/services/notifications.service';

@EventsHandler(SendToTeamMembersEvent)
export class SendToTeamMembersHandler
  implements IEventHandler<SendToTeamMembersEvent>
{
  constructor(private readonly notificationsService: NotificationsService) {}

  async handle(event: SendToTeamMembersEvent) {
    await this.notificationsService.sendToTeamMembers(event.readableTeamId);
  }
}
