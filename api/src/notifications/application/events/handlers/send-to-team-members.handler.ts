import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { SendToTeamMembersEvent } from '../send-to-team-members.event.js';
import { NotificationsService } from '../../../infrastructure/services/notifications.service.js';

@EventsHandler(SendToTeamMembersEvent)
export class SendToTeamMembersHandler implements IEventHandler<SendToTeamMembersEvent> {
  constructor(private readonly notificationsService: NotificationsService) {}

  async handle(event: SendToTeamMembersEvent) {
    await this.notificationsService.sendToTeamMembers(event.readableTeamId);
  }
}
