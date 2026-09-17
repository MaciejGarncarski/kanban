import { UnauthorizedException } from '@nestjs/common';
import { QueryHandler } from '@nestjs/cqrs';
import { GetUsersByTeamIdQuery } from '../get-users-by-team-id.query.js';
import { UserRepository } from '../../../infrastructure/persistence/user.repository.js';

@QueryHandler(GetUsersByTeamIdQuery)
export class GetUsersByTeamIdHandler {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(query: GetUsersByTeamIdQuery) {
    const userIsInTeam = await this.userRepository.isUserInTeamByTeam(
      query.userId,
      query.readableTeamId,
    );

    if (!userIsInTeam) {
      throw new UnauthorizedException(
        'User is not authorized to access this team',
      );
    }

    return this.userRepository.findAllByTeamId(query.readableTeamId);
  }
}
