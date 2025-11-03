import { UnauthorizedException } from '@nestjs/common';
import { QueryHandler } from '@nestjs/cqrs';
import { GetUsersByTeamIdQuery } from 'src/user/application/queries/get-users-by-team-id.query';
import { UserRepository } from 'src/user/infrastructure/persistence/user.repository';

@QueryHandler(GetUsersByTeamIdQuery)
export class GetUsersByTeamIdHandler {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(query: GetUsersByTeamIdQuery) {
    const userIsInTeam = await this.userRepository.isUserInTeamByTeam(
      query.userId,
      query.teamId,
    );

    if (!userIsInTeam) {
      throw new UnauthorizedException(
        'User is not authorized to access this columns',
      );
    }

    return this.userRepository.findAllByTeamId(query.teamId);
  }
}
