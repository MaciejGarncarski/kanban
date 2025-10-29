import { Module } from '@nestjs/common';
import { GetTeamsHandler } from 'src/team/application/queries/handlers/get-teams.handler';
import { TeamController } from 'src/team/infrastructure/controllers/team.controller';
import { TeamRepository } from 'src/team/infrastructure/persistence/team.repository';

const CommandHandlers = [GetTeamsHandler];
const QueryHandlers = [];
const Repositories = [TeamRepository];

@Module({
  controllers: [TeamController],
  providers: [...QueryHandlers, ...CommandHandlers, ...Repositories],
})
export class TeamModule {}
