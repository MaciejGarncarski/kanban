import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteTeamCommand } from 'src/team/application/commands/delete-team.command';
import { teamRoles } from 'src/team/domain/types/team.types';
import { TeamRepository } from 'src/team/infrastructure/persistence/team.repository';
import { UserRepository } from 'src/user/infrastructure/persistence/user.repository';

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
