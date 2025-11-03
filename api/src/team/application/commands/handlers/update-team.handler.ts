import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateTeamCommand } from 'src/team/application/commands/update-team.command';
import { TeamRepository } from 'src/team/infrastructure/persistence/team.repository';

@CommandHandler(UpdateTeamCommand)
export class UpdateTeamHandler implements ICommandHandler<UpdateTeamCommand> {
  constructor(private readonly teamRepository: TeamRepository) {}

  async execute(command: UpdateTeamCommand): Promise<void> {
    const { teamId, userId, name, description, members } = command;

    await this.teamRepository.updateTeam(
      userId,
      teamId,
      {
        name,
        description,
      },
      members,
    );
  }
}
