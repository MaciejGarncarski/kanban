import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { type DB } from 'src/infrastructure/persistence/db/client';
import { InjectDb } from 'src/infrastructure/persistence/db/db.provider';
import { team_members, teams } from 'src/infrastructure/persistence/db/schema';
import { GetTeamsResponseDto } from 'src/teams/application/dtos/get-teams.response.dto';
import { TeamsRepositoryInterface } from 'src/teams/domain/ports/teams.interface';

@Injectable()
export class TeamsRepository implements TeamsRepositoryInterface {
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
        created_at: new Date(row.teams.created_at),
        description: row.teams.description || '',
      };
    });

    return { teams: userTeams };
  }
}
