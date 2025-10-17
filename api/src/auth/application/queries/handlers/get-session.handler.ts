import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { UnauthorizedException } from '@nestjs/common';
import { GetSessionQuery } from 'src/auth/application/queries/get-session.query';
import { UserRepository } from 'src/user/infrastructure/persistence/user.repository';

@QueryHandler(GetSessionQuery)
export class GetSessionHandler implements IQueryHandler<GetSessionQuery> {
  constructor(private readonly userRepo: UserRepository) {}

  async execute(query: GetSessionQuery) {
    const user = await this.userRepo.find(query.userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }
}
