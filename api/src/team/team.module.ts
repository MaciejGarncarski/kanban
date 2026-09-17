import { Module } from '@nestjs/common';
import { ProfanityCheckService } from '../infrastructure/services/profanity-check.service.js';
import { SendToTeamMembersHandler } from '../notifications/application/events/handlers/send-to-team-members.handler.js';
import { NotificationsService } from '../notifications/infrastructure/services/notifications.service.js';
import { CreateTeamHandler } from './application/commands/handlers/create-team.handler.js';
import { DeleteTeamHandler } from './application/commands/handlers/delete-team.handler.js';
import { UpdateTeamHandler } from './application/commands/handlers/update-team.handler.js';
import { GetTeamsHandler } from './application/queries/handlers/get-teams.handler.js';
import { TeamController } from './infrastructure/controllers/team.controller.js';
import { TeamRepository } from './infrastructure/persistence/team.repository.js';
import { UserRepository } from '../user/infrastructure/persistence/user.repository.js';

const CommandHandlers = [
  CreateTeamHandler,
  DeleteTeamHandler,
  UpdateTeamHandler,
];
const QueryHandlers = [GetTeamsHandler];
const EventsHandlers = [SendToTeamMembersHandler];
const Repositories = [TeamRepository, UserRepository];

@Module({
  providers: [
    ...QueryHandlers,
    ...CommandHandlers,
    ...EventsHandlers,
    ...Repositories,
    NotificationsService,
    ProfanityCheckService,
  ],
  controllers: [TeamController],
})
export class TeamModule {}
