import { InferInsertModel } from 'drizzle-orm';
import { teams } from 'src/infrastructure/persistence/db/schema';
import { GetTeamsResponseDto } from 'src/team/application/dtos/get-teams.response.dto';
import { TeamRole } from 'src/team/domain/types/team.types';

export type InsertTeamDto = InferInsertModel<typeof teams>;

export interface TeamRepositoryInterface {
  getUserTeams(userId: string): Promise<GetTeamsResponseDto>;
  createTeam(userId: string, teamData: InsertTeamDto): Promise<void>;
  deleteTeam(teamId: string): Promise<void>;
  updateTeam(teamId: string, teamData: InsertTeamDto): Promise<void>;
  getUserRole(boardId: string, userId: string): Promise<TeamRole | null>;
}
