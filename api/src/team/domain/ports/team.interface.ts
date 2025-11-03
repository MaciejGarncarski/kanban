import { InferInsertModel } from 'drizzle-orm';
import { teams } from 'src/infrastructure/persistence/db/schema';
import { GetTeamsResponseDto } from 'src/team/application/dtos/get-teams.response.dto';
import { TeamEntity } from 'src/team/domain/team.entity';
import { TeamRole } from 'src/team/domain/types/team.types';

export type InsertTeamDto = InferInsertModel<typeof teams>;
export type UpdateTeamDto = Partial<InsertTeamDto>;

export interface TeamRepositoryInterface {
  getUserTeams(userId: string): Promise<GetTeamsResponseDto>;
  createTeam(
    userId: string,
    teamData: UpdateTeamDto,
    teamMembersIds: string[],
  ): Promise<TeamEntity>;
  deleteTeam(teamId: string): Promise<void>;
  updateTeam(
    userId: string,
    teamId: string,
    teamData: InsertTeamDto,
  ): Promise<void>;
  getUserRole(boardId: string, userId: string): Promise<TeamRole | null>;
  findById(teamId: string): Promise<TeamEntity | null>;
}
