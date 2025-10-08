import { Injectable } from '@nestjs/common';
import { UserRepository } from 'src/user/user.repository';

@Injectable()
export class AppService {
  constructor(private readonly userRepo: UserRepository) {}
  async getHello(): Promise<string> {
    return (await this.userRepo.find(3)).name;
  }
}
