import { Module } from '@nestjs/common';
import { CreateTeamHandler } from 'src/team/application/commands/handlers/create-team.handler';
import { GetTeamsHandler } from 'src/team/application/queries/handlers/get-teams.handler';
import { TeamController } from 'src/team/infrastructure/controllers/team.controller';
import { TeamRepository } from 'src/team/infrastructure/persistence/team.repository';

const CommandHandlers = [CreateTeamHandler];
const QueryHandlers = [GetTeamsHandler];
const Repositories = [TeamRepository];

@Module({
  providers: [...QueryHandlers, ...CommandHandlers, ...Repositories],
  controllers: [TeamController],
})
export class TeamModule {}
