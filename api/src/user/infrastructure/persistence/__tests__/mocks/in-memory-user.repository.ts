import { Injectable } from '@nestjs/common';
import { TeamRole } from 'src/team/domain/types/team.types';
import { UserRepositoryInterface } from 'src/user/domain/ports/user.interface';
import { UserEntity } from 'src/user/domain/user.entity';
import { NewUserRecord } from 'src/user/infrastructure/persistence/mappers/user.mapper';
import { v7 } from 'uuid';

@Injectable()
export class InMemoryUserRepository implements UserRepositoryInterface {
  private users: UserEntity[] = [];

  async getUserRoleByBoardId(boardId: string, userId: string) {
    return 'member' as TeamRole;
  }

  async getUserRoleByColumnId(columnId: string, userId: string) {
    return 'member' as TeamRole;
  }

  async getUserRoleByTeamId(teamId: string, userId: string) {
    return 'member' as TeamRole;
  }

  async find(id: string) {
    const user = this.users.find((user) => user.id === id);

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  async findByEmail(email: string) {
    const user = this.users.find((user) => user.email === email);

    if (!user) {
      return null;
    }

    return user;
  }

  async all() {
    return this.users;
  }

  async lastTen() {
    return this.users.slice(-10);
  }

  async create(data: NewUserRecord) {
    const newUser = new UserEntity({
      id: v7(),
      name: data.name,
      email: data.email,
      passwordHash: data.password_hash,
    });

    this.users.push(newUser);
    return newUser;
  }

  async findAllByBoardId(boardId: string): Promise<UserEntity[]> {
    // Mock implementation, returns all users
    return this.users;
  }

  async isUserInTeamByColumn(
    userId: string,
    columnId: string,
  ): Promise<boolean> {
    // Mock implementation, always returns true
    return true;
  }

  async isUserInTeamByBoard(userId: string, boardId: string): Promise<boolean> {
    // Mock implementation, always returns true
    return true;
  }

  clear(): void {
    this.users = [];
  }
}
