import { BadRequestException } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { ProfanityCheckService } from '../../../../infrastructure/services/profanity-check.service.js';
import { SendToTeamMembersEvent } from '../../../../notifications/application/events/send-to-team-members.event.js';
import { UpdateTeamCommand } from '../update-team.command.js';
import { TeamRepository } from '../../../infrastructure/persistence/team.repository.js';

@CommandHandler(UpdateTeamCommand)
export class UpdateTeamHandler implements ICommandHandler<UpdateTeamCommand> {
  constructor(
    private readonly teamRepository: TeamRepository,
    private readonly profanityCheckService: ProfanityCheckService,
    private readonly eventBus: EventBus,
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

    this.eventBus.publish(new SendToTeamMembersEvent(readableTeamId));
  }
}
