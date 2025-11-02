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
import { TeamEntity } from 'src/team/domain/team.entity';
import { TeamRole, teamRoles } from 'src/team/domain/types/team.types';

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
        name: row.teams.name,
        readableId: row.teams.readable_id,
        createdAt: row.teams.created_at,
        description: row.teams.description || '',
      };
    });

    return { teams: userTeams };
  }

  async createTeam(
    userId: string,
    teamData: InsertTeamDto,
    teamMembersIds: string[],
  ): Promise<TeamEntity> {
    const team = await this.db.transaction(async (tx): Promise<TeamEntity> => {
      const [createdTeam] = await tx.insert(teams).values(teamData).returning();

      await tx.insert(team_members).values({
        team_id: createdTeam.id,
        user_id: userId,
        role: teamRoles.ADMIN,
      });

      await tx.insert(team_members).values(
        teamMembersIds.map((memberId) => ({
          team_id: createdTeam.id,
          user_id: memberId,
          role: teamRoles.MEMBER,
        })),
      );

      return new TeamEntity({
        id: createdTeam.id,
        name: createdTeam.name,
        readableId: createdTeam.readable_id,
        description: createdTeam.description,
        createdAt: new Date(createdTeam.created_at),
      });
    });

    return team;
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
