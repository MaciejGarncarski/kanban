import { Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { type DB } from 'src/infrastructure/persistence/db/client';
import { InjectDb } from 'src/infrastructure/persistence/db/db.provider';
import { team_members, teams } from 'src/infrastructure/persistence/db/schema';
import { GetTeamsResponseDto } from 'src/team/application/dtos/get-teams.response.dto';
import {
  InsertTeamDto,
  TeamRepositoryInterface,
} from 'src/team/domain/ports/team.interface';
import { TeamRole } from 'src/team/domain/types/team.types';

@Injectable()
export class TeamRepository implements TeamRepositoryInterface {
  constructor(@InjectDb() private readonly db: DB) {}

  async getUserTeams(userId: string): Promise<GetTeamsResponseDto> {
    const rawResult = await this.db
      .select()
      .from(teams)
      .innerJoin(team_members, eq(team_members.team_id, teams.id))
      .where(eq(team_members.user_id, userId));

    const userTeams = rawResult.map((row) => {
      return {
        ...row.teams,
        created_at: row.teams.created_at,
        description: row.teams.description || '',
      };
    });

    return { teams: userTeams };
  }

  async createTeam(userId: string, teamData: InsertTeamDto): Promise<void> {
    const [createdTeam] = await this.db
      .insert(teams)
      .values(teamData)
      .returning();

    await this.db.insert(team_members).values({
      team_id: createdTeam.id,
      user_id: userId,
      role: 'owner',
    });
  }

  async deleteTeam(teamId: string): Promise<void> {
    await this.db.delete(teams).where(eq(teams.id, teamId));
  }

  async updateTeam(teamId: string, teamData: InsertTeamDto): Promise<void> {
    await this.db.update(teams).set(teamData).where(eq(teams.id, teamId));
  }

  async getUserRole(boardId: string, userId: string): Promise<TeamRole | null> {
    const result = await this.db
      .select()
      .from(team_members)
      .where(
        and(
          eq(team_members.team_id, boardId),
          eq(team_members.user_id, userId),
        ),
      )
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    return result[0].role as TeamRole;
  }
}
