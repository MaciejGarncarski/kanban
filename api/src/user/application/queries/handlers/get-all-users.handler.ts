import { type IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetAllUsersQuery } from 'src/user/application/queries/get-all-users.query';
import { UserEntity } from 'src/user/domain/user.entity';
import { UserRepository } from 'src/user/infrastructure/persistence/user.repository';

@QueryHandler(GetAllUsersQuery)
export class GetAllUsersHandler implements IQueryHandler<GetAllUsersQuery> {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(query: GetAllUsersQuery): Promise<UserEntity[]> {
    const allUsers = await this.userRepository.findAll();

    return allUsers;
  }
}
