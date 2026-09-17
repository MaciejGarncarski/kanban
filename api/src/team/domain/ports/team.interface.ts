import { InferInsertModel } from 'drizzle-orm';
import { teams } from '../../../infrastructure/persistence/db/schema.js';
import { GetTeamsResponseDto } from '../../application/dtos/get-teams.response.dto.js';
import { TeamAggregate } from '../team.entity.js';

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
