import { BadRequestException, Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { type DB } from 'src/infrastructure/persistence/db/client';
import { InjectDb } from 'src/infrastructure/persistence/db/db.provider';
import {
  boards,
  columns,
  lower,
  team_members,
  teams,
  users,
} from 'src/infrastructure/persistence/db/schema';
import { TeamRole } from 'src/team/domain/types/team.types';
import { UserRepositoryInterface } from 'src/user/domain/ports/user.interface';
import { UserMapper } from 'src/user/infrastructure/persistence/mappers/user.mapper';

@Injectable()
export class UserRepository implements UserRepositoryInterface {
  constructor(@InjectDb() private readonly db: DB) {}

  async getUserRoleByColumnId(
    columnId: string,
    userId: string,
  ): Promise<TeamRole> {
    const [teamMember] = await this.db
      .select()
      .from(team_members)
      .innerJoin(teams, eq(team_members.team_id, teams.id))
      .innerJoin(boards, eq(boards.team_id, teams.id))
      .innerJoin(columns, eq(columns.board_id, boards.id))
      .where(and(eq(columns.id, columnId), eq(team_members.user_id, userId)));

    if (!teamMember) {
      throw new BadRequestException(
        'User is not a member of the specified team',
      );
    }

    return teamMember.team_members.role as TeamRole;
  }

  async getUserRoleByTeamId(teamId: string, userId: string): Promise<TeamRole> {
    const [teamMember] = await this.db
      .select()
      .from(team_members)
      .where(
        and(eq(team_members.team_id, teamId), eq(team_members.user_id, userId)),
      );

    if (!teamMember) {
      throw new BadRequestException(
        'User is not a member of the specified team',
      );
    }

    return teamMember.role as TeamRole;
  }

  async find(id: string) {
    const [user] = await this.db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        created_at: users.created_at,
        password_hash: users.password_hash,
      })
      .from(users)
      .where(eq(users.id, id));

    if (!user) {
      return null;
    }

    return UserMapper.toDomain(user);
  }

  async findByEmail(email: string) {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(lower(users.email), email.toLowerCase()));

    if (!user) {
      return null;
    }

    return UserMapper.toDomain(user);
  }

  async all() {
    const allUsers = await this.db.select().from(users);
    return allUsers.map((user) => UserMapper.toDomain(user));
  }

  async lastTen() {
    const lastTenUsers = await this.db.select().from(users).limit(10);
    return lastTenUsers.map((user) => UserMapper.toDomain(user));
  }

  async create(data: typeof users.$inferInsert) {
    const [createdUser] = await this.db.insert(users).values(data).returning();

    return UserMapper.toDomain(createdUser);
  }

  async findAllByBoardId(boardId: string) {
    const usersOnBoard = await this.db
      .select()
      .from(users)
      .innerJoin(team_members, eq(users.id, team_members.user_id))
      .innerJoin(teams, eq(team_members.team_id, teams.id))
      .innerJoin(boards, eq(boards.team_id, teams.id))
      .where(eq(boards.id, boardId));

    return usersOnBoard.map(({ users }) => {
      return UserMapper.toDomain(users);
    });
  }

  async isUserInTeamByColumn(userId: string, columnId: string) {
    const [userInTeam] = await this.db
      .select()
      .from(users)
      .innerJoin(team_members, eq(users.id, team_members.user_id))
      .innerJoin(teams, eq(team_members.team_id, teams.id))
      .innerJoin(boards, eq(boards.team_id, teams.id))
      .innerJoin(columns, eq(columns.board_id, boards.id))
      .where(and(eq(columns.id, columnId), eq(users.id, userId)));

    return Boolean(userInTeam);
  }

  async isUserInTeamByBoard(userId: string, boardId: string) {
    const [userInTeam] = await this.db
      .select()
      .from(users)
      .innerJoin(team_members, eq(users.id, team_members.user_id))
      .innerJoin(teams, eq(team_members.team_id, teams.id))
      .innerJoin(boards, eq(boards.team_id, teams.id))
      .where(and(eq(boards.id, boardId), eq(users.id, userId)));

    return Boolean(userInTeam);
  }
}
