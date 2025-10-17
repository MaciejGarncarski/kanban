import { Injectable } from '@nestjs/common';
import { UserRepository } from 'src/user/infrastructure/persistence/user.repository';

@Injectable()
export class UserService {
  constructor(private readonly userRepo: UserRepository) {}

  async getLastUsers() {
    const lastUsers = await this.userRepo.lastTen();
    return lastUsers;
  }
}
