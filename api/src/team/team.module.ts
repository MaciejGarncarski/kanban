import { Module } from '@nestjs/common';
import { CreateTeamHandler } from 'src/team/application/commands/handlers/create-team.handler';
import { DeleteTeamHandler } from 'src/team/application/commands/handlers/delete-team.handler';
import { UpdateTeamHandler } from 'src/team/application/commands/handlers/update-team.handler';
import { GetTeamsHandler } from 'src/team/application/queries/handlers/get-teams.handler';
import { TeamController } from 'src/team/infrastructure/controllers/team.controller';
import { TeamRepository } from 'src/team/infrastructure/persistence/team.repository';
import { UserRepository } from 'src/user/infrastructure/persistence/user.repository';

const CommandHandlers = [
  CreateTeamHandler,
  DeleteTeamHandler,
  UpdateTeamHandler,
];
const QueryHandlers = [GetTeamsHandler];
const Repositories = [TeamRepository, UserRepository];

@Module({
  providers: [...QueryHandlers, ...CommandHandlers, ...Repositories],
  controllers: [TeamController],
})
export class TeamModule {}
