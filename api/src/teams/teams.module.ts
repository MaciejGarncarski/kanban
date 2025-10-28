import { Module } from '@nestjs/common';
import { GetTeamsHandler } from 'src/teams/application/queries/handlers/get-teams.handler';
import { TeamsController } from 'src/teams/infrastructure/controllers/teams.controller';
import { TeamsRepository } from 'src/teams/infrastructure/persistence/teams.repository';

const CommandHandlers = [];
const QueryHandlers = [GetTeamsHandler];

@Module({
  controllers: [TeamsController],
  providers: [...QueryHandlers, TeamsRepository],
})
export class TeamsModule {}
