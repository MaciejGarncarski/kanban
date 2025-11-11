import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { type DB } from 'src/infrastructure/persistence/db/client';
import { InjectDb } from 'src/infrastructure/persistence/db/db.provider';
import {
  boards,
  team_members,
  teams,
} from 'src/infrastructure/persistence/db/schema';
import { GetTeamsResponseDto } from 'src/team/application/dtos/get-teams.response.dto';
import {
  InsertTeamDto,
  TeamRepositoryInterface,
  UpdateTeamDto,
} from 'src/team/domain/ports/team.interface';
import { TeamAggregate } from 'src/team/domain/team.entity';
import { teamRoles } from 'src/team/domain/types/team.types';

@Injectable()
export class TeamRepository implements TeamRepositoryInterface {
  constructor(@InjectDb() private readonly db: DB) {}

  async getUserTeams(userId: string): Promise<GetTeamsResponseDto> {
    const rawResult = await this.db
      .select()
      .from(teams)
      .innerJoin(team_members, eq(team_members.team_id, teams.id))
      .where(eq(team_members.user_id, userId));

    const userTeams = rawResult
      .map((row) => {
        return {
          name: row.teams.name,
          readableId: row.teams.readable_id,
          createdAt: row.teams.created_at,
          description: row.teams.description || '',
        };
      })
      .filter(
        (team, index, self) =>
          index === self.findIndex((t) => t.readableId === team.readableId),
      );

    return { teams: userTeams };
  }

  async createTeam(
    userId: string,
    teamData: InsertTeamDto,
    teamMembersIds: string[],
  ): Promise<TeamAggregate> {
    const team = await this.db.transaction(
      async (tx): Promise<TeamAggregate> => {
        const [createdTeam] = await tx
          .insert(teams)
          .values(teamData)
          .returning();

        await tx.insert(team_members).values({
          team_id: createdTeam.id,
          user_id: userId,
          role: teamRoles.ADMIN,
        });

        if (teamMembersIds.length > 0) {
          await tx.insert(team_members).values(
            teamMembersIds.map((memberId) => ({
              team_id: createdTeam.id,
              user_id: memberId,
              role: teamRoles.MEMBER,
            })),
          );
        }

        return new TeamAggregate({
          id: createdTeam.id,
          name: createdTeam.name,
          readableId: createdTeam.readable_id,
          description: createdTeam.description,
          createdAt: new Date(createdTeam.created_at),
        });
      },
    );

    return team;
  }

  async deleteTeam(readableTeamId: string): Promise<null | true> {
    const foundTeam = await this.db
      .select()
      .from(teams)
      .where(eq(teams.readable_id, readableTeamId))
      .limit(1)
      .then((rows) => rows[0]);

    if (!foundTeam) {
      return null;
    }

    await this.db
      .delete(team_members)
      .where(eq(team_members.team_id, foundTeam.id));

    await this.db.delete(boards).where(eq(boards.team_id, foundTeam.id));

    await this.db.delete(teams).where(eq(teams.readable_id, readableTeamId));

    return true;
  }

  async updateTeam(
    userId: string,
    readableTeamId: string,
    teamData: UpdateTeamDto,
    members?: string[],
  ): Promise<void> {
    await this.db.transaction(async (tx) => {
      if (members) {
        const foundTeam = await tx
          .select()
          .from(teams)
          .where(eq(teams.readable_id, readableTeamId))
          .limit(1)
          .then((rows) => rows[0]);

        if (foundTeam) {
          await tx
            .delete(team_members)
            .where(eq(team_members.team_id, foundTeam.id));

          await tx.insert(team_members).values(
            members.map((memberId) => ({
              team_id: foundTeam.id,
              user_id: memberId,
              role: memberId === userId ? teamRoles.ADMIN : teamRoles.MEMBER,
            })),
          );
        }
      }

      await this.db
        .update(teams)
        .set(teamData)
        .where(eq(teams.readable_id, readableTeamId));
    });
  }

  async findById(readableTeamId: string): Promise<TeamAggregate | null> {
    const team = await this.db
      .select()
      .from(teams)
      .where(eq(teams.readable_id, readableTeamId))
      .limit(1)
      .then((rows) => rows[0]);

    if (!team) {
      return null;
    }

    return new TeamAggregate({
      id: team.id,
      name: team.name,
      readableId: team.readable_id,
      description: team.description,
      createdAt: new Date(team.created_at),
    });
  }

  async getTeamMemberIdsByReadableId(
    readableTeamId: string,
  ): Promise<string[]> {
    const team = await this.db
      .select()
      .from(teams)
      .where(eq(teams.readable_id, readableTeamId))
      .limit(1)
      .then((rows) => rows[0]);

    if (!team) {
      return [];
    }

    const members = await this.db
      .select()
      .from(team_members)
      .where(eq(team_members.team_id, team.id));

    return members.map((member) => member.user_id);
  }
}
