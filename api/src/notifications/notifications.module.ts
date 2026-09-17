import { Module } from '@nestjs/common';
import { SendToTeamMembersHandler } from './application/events/handlers/send-to-team-members.handler.js';
import { NotificationsController } from './infrastructure/controllers/notifications.controller.js';
import { NotificationsService } from './infrastructure/services/notifications.service.js';
import { TeamRepository } from '../team/infrastructure/persistence/team.repository.js';

const CommandHandlers = [];
const QueryHandlers = [];
const Repositories = [TeamRepository];

@Module({
  exports: [NotificationsService],
  controllers: [NotificationsController],
  providers: [
    ...QueryHandlers,
    ...CommandHandlers,
    ...Repositories,
    NotificationsService,
    SendToTeamMembersHandler,
  ],
})
export class NotificationsModule {}
