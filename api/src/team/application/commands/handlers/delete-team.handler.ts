import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteTeamCommand } from '../delete-team.command.js';
import { teamRoles } from '../../../domain/types/team.types.js';
import { TeamRepository } from '../../../infrastructure/persistence/team.repository.js';
import { UserRepository } from '../../../../user/infrastructure/persistence/user.repository.js';

@CommandHandler(DeleteTeamCommand)
export class DeleteTeamHandler implements ICommandHandler<DeleteTeamCommand> {
  constructor(
    private readonly teamRepository: TeamRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(command: DeleteTeamCommand): Promise<void> {
    const { userId, readableTeamId } = command;

    const team = await this.teamRepository.findById(readableTeamId);

    if (!team) {
      throw new BadRequestException('Team not found');
    }

    const isAdmin =
      (await this.userRepository.getUserRolebyReadableTeamId(
        readableTeamId,
        userId,
      )) === teamRoles.ADMIN;

    if (!isAdmin) {
      throw new ForbiddenException('Only admins can delete the team');
    }

    await this.teamRepository.deleteTeam(readableTeamId);
  }
}
