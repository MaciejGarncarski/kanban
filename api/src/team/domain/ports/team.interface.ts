import { InferInsertModel } from 'drizzle-orm';
import { teams } from 'src/infrastructure/persistence/db/schema';
import { GetTeamsResponseDto } from 'src/team/application/dtos/get-teams.response.dto';
import { TeamAggregate } from 'src/team/domain/team.entity';

export type InsertTeamDto = InferInsertModel<typeof teams>;
export type UpdateTeamDto = Partial<InsertTeamDto>;

export interface TeamRepositoryInterface {
  getUserTeams(userId: string): Promise<GetTeamsResponseDto>;
  createTeam(
    userId: string,
    teamData: UpdateTeamDto,
    teamMembersIds: string[],
  ): Promise<TeamAggregate>;
  deleteTeam(readableTeamId: string): Promise<null | true>;
  updateTeam(
    userId: string,
    readableTeamId: string,
    teamData: InsertTeamDto,
  ): Promise<void>;
  findById(readableTeamId: string): Promise<TeamAggregate | null>;
}
