import { type IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetAllUsersQuery } from '../get-all-users.query.js';
import { UserEntity } from '../../../domain/user.entity.js';
import { UserRepository } from '../../../infrastructure/persistence/user.repository.js';

@QueryHandler(GetAllUsersQuery)
export class GetAllUsersHandler implements IQueryHandler<GetAllUsersQuery> {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(): Promise<UserEntity[]> {
    const allUsers = await this.userRepository.findAll();

    return allUsers;
  }
}
