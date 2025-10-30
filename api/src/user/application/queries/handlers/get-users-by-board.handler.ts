import { UnauthorizedException } from '@nestjs/common';
import { QueryHandler } from '@nestjs/cqrs';
import { GetUsersByBoardQuery } from 'src/user/application/queries/get-users-by-board.query';
import { UserRepository } from 'src/user/infrastructure/persistence/user.repository';

@QueryHandler(GetUsersByBoardQuery)
export class GetUsersByBoardHandler {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(query: GetUsersByBoardQuery) {
    const userIsInTeam = await this.userRepository.isUserInTeamByBoard(
      query.userId,
      query.boardId,
    );

    if (!userIsInTeam) {
      throw new UnauthorizedException(
        'User is not authorized to access this columns',
      );
    }

    return this.userRepository.findAllByBoardId(query.boardId);
  }
}
