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

  async findAll() {
    const allUsers = await this.db.select().from(users);
    return allUsers.map((user) => UserMapper.toDomain(user));
  }

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
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        teamId,
      );

    const condition = isUuid
      ? eq(team_members.team_id, teamId)
      : eq(teams.readable_id, teamId);

    const [result] = await this.db
      .select({ role: team_members.role })
      .from(team_members)
      .innerJoin(teams, eq(team_members.team_id, teams.id))
      .where(and(condition, eq(team_members.user_id, userId)));

    if (!result) {
      throw new BadRequestException(
        'User is not a member of the specified team',
      );
    }

    return result.role as TeamRole;
  }

  async getUserRoleByBoardId(
    boardId: string,
    userId: string,
  ): Promise<TeamRole> {
    const [teamMember] = await this.db
      .select()
      .from(team_members)
      .innerJoin(teams, eq(team_members.team_id, teams.id))
      .innerJoin(boards, eq(boards.team_id, teams.id))
      .where(
        and(eq(boards.readable_id, boardId), eq(team_members.user_id, userId)),
      );

    if (!teamMember) {
      throw new BadRequestException(
        'User is not a member of the specified team',
      );
    }

    return teamMember.team_members.role as TeamRole;
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
      .where(eq(boards.readable_id, boardId));

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
      .where(and(eq(boards.readable_id, boardId), eq(users.id, userId)));

    return Boolean(userInTeam);
  }

  async isUserInTeamByTeam(userId: string, teamId: string) {
    const [userInTeam] = await this.db
      .select()
      .from(users)
      .innerJoin(team_members, eq(users.id, team_members.user_id))
      .innerJoin(teams, eq(team_members.team_id, teams.id))
      .where(and(eq(teams.readable_id, teamId), eq(users.id, userId)));

    return Boolean(userInTeam);
  }

  async findAllByTeamId(teamId: string) {
    const usersInTeam = await this.db
      .select()
      .from(users)
      .innerJoin(team_members, eq(users.id, team_members.user_id))
      .innerJoin(teams, eq(team_members.team_id, teams.id))
      .where(eq(teams.readable_id, teamId));

    return usersInTeam.map(({ users }) => {
      return UserMapper.toDomain(users);
    });
  }
}
