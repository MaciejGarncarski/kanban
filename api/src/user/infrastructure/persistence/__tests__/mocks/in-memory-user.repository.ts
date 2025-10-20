import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { UserRepositoryPort } from 'src/user/application/ports/user.repository.port';
import { User } from 'src/user/domain/user.entity';
import { NewUserRecord } from 'src/user/infrastructure/persistence/mappers/user.mapper';

@Injectable()
export class InMemoryUserRepository implements UserRepositoryPort {
  private users: User[] = [];

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
      throw new NotFoundException('User not found');
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
    const newUser = new User({
      id: randomUUID(),
      name: data.name,
      email: data.email,
      passwordHash: data.password_hash,
    });

    this.users.push(newUser);
    return newUser;
  }

  clear(): void {
    this.users = [];
  }
}
