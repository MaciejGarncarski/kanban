import { BadRequestException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ProfanityCheckService } from 'src/infrastructure/services/profanity-check.service';
import { UpdateTeamCommand } from 'src/team/application/commands/update-team.command';
import { TeamRepository } from 'src/team/infrastructure/persistence/team.repository';

@CommandHandler(UpdateTeamCommand)
export class UpdateTeamHandler implements ICommandHandler<UpdateTeamCommand> {
  constructor(
    private readonly teamRepository: TeamRepository,
    private readonly profanityCheckService: ProfanityCheckService,
  ) {}

  async execute(command: UpdateTeamCommand): Promise<void> {
    const { readableTeamId, userId, name, description, members } = command;

    if (name) {
      const nameHasProfanity = await this.profanityCheckService.isProfane(name);

      if (nameHasProfanity) {
        throw new BadRequestException(
          'Team name contains inappropriate language.',
        );
      }
    }

    if (description && typeof description === 'string') {
      const descriptionHasProfanity =
        await this.profanityCheckService.isProfane(description);

      if (descriptionHasProfanity) {
        throw new BadRequestException(
          'Team description contains inappropriate language.',
        );
      }
    }

    await this.teamRepository.updateTeam(
      userId,
      readableTeamId,
      {
        name,
        description,
      },
      members,
    );
  }
}
