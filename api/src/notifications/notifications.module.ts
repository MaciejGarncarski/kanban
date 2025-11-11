import { Module } from '@nestjs/common';
import { SendToTeamMembersHandler } from 'src/notifications/application/events/handlers/send-to-team-members.handler';
import { NotificationsController } from 'src/notifications/infrastructure/controllers/notifications.controller';
import { NotificationsService } from 'src/notifications/infrastructure/services/notifications.service';
import { TeamRepository } from 'src/team/infrastructure/persistence/team.repository';

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
