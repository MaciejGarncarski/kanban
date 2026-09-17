import { BadRequestException, Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { type DB } from '../../../infrastructure/persistence/db/client.js';
import { InjectDb } from '../../../infrastructure/persistence/db/db.provider.js';
import {
  boards,
  columns,
  lower,
  team_members,
  teams,
  users,
} from '../../../infrastructure/persistence/db/schema.js';
import { TeamRole } from '../../../team/domain/types/team.types.js';
import { UserRepositoryInterface } from '../../domain/ports/user.interface.js';
import { UserMapper } from './mappers/user.mapper.js';

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
        'User is not authorized to access this team',
      );
    }

    return teamMember.team_members.role as TeamRole;
  }

  async getUserRoleByTeamId(
    teamUUID: string,
    userId: string,
  ): Promise<TeamRole> {
    const [teamMember] = await this.db
      .select()
      .from(team_members)
      .innerJoin(teams, eq(team_members.team_id, teams.id))
      .where(and(eq(teams.id, teamUUID), eq(team_members.user_id, userId)));

    if (!teamMember) {
      throw new BadRequestException(
        'User is not authorized to access this team',
      );
    }

    return teamMember.team_members.role as TeamRole;
  }

  async getUserRolebyReadableTeamId(
    readableTeamId: string,
    userId: string,
  ): Promise<TeamRole> {
    const [teamMember] = await this.db
      .select()
      .from(team_members)
      .innerJoin(teams, eq(team_members.team_id, teams.id))
      .where(
        and(
          eq(teams.readable_id, readableTeamId),
          eq(team_members.user_id, userId),
        ),
      );

    if (!teamMember) {
      throw new BadRequestException(
        'User is not authorized to access this team',
      );
    }

    return teamMember.team_members.role as TeamRole;
  }

  async getUserRoleByBoardId(
    readableBoardId: string,
    userId: string,
  ): Promise<TeamRole> {
    const [teamMember] = await this.db
      .select()
      .from(team_members)
      .innerJoin(teams, eq(team_members.team_id, teams.id))
      .innerJoin(boards, eq(boards.team_id, teams.id))
      .where(
        and(
          eq(boards.readable_id, readableBoardId),
          eq(team_members.user_id, userId),
        ),
      );

    if (!teamMember) {
      throw new BadRequestException(
        'User is not authorized to access this team',
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

  async create(data: typeof users.$inferInsert) {
    const [createdUser] = await this.db.insert(users).values(data).returning();
    return UserMapper.toDomain(createdUser);
  }

  async findAllByBoardId(readableBoardId: string) {
    const usersOnBoard = await this.db
      .select()
      .from(users)
      .innerJoin(team_members, eq(users.id, team_members.user_id))
      .innerJoin(teams, eq(team_members.team_id, teams.id))
      .innerJoin(boards, eq(boards.team_id, teams.id))
      .where(eq(boards.readable_id, readableBoardId));

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

  async isUserInTeamByBoard(userId: string, readableBoardId: string) {
    const [userInTeam] = await this.db
      .select()
      .from(users)
      .innerJoin(team_members, eq(users.id, team_members.user_id))
      .innerJoin(teams, eq(team_members.team_id, teams.id))
      .innerJoin(boards, eq(boards.team_id, teams.id))
      .where(
        and(eq(boards.readable_id, readableBoardId), eq(users.id, userId)),
      );

    return Boolean(userInTeam);
  }

  async isUserInTeamByTeam(userId: string, readableTeamId: string) {
    const [userInTeam] = await this.db
      .select()
      .from(users)
      .innerJoin(team_members, eq(users.id, team_members.user_id))
      .innerJoin(teams, eq(team_members.team_id, teams.id))
      .where(and(eq(teams.readable_id, readableTeamId), eq(users.id, userId)));

    return Boolean(userInTeam);
  }

  async findAllByTeamId(readableTeamId: string) {
    const usersInTeam = await this.db
      .select()
      .from(users)
      .innerJoin(team_members, eq(users.id, team_members.user_id))
      .innerJoin(teams, eq(team_members.team_id, teams.id))
      .where(eq(teams.readable_id, readableTeamId));

    return usersInTeam.map(({ users }) => {
      return UserMapper.toDomain(users);
    });
  }
}
