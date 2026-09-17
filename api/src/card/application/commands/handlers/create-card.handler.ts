import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { CreateCardCommand } from '../create-card.command.js';
import { CardRepository } from '../../../infrastructure/persistence/card.repository.js';
import { ProfanityCheckService } from '../../../../infrastructure/services/profanity-check.service.js';
import { SendToTeamMembersEvent } from '../../../../notifications/application/events/send-to-team-members.event.js';
import { UserRepository } from '../../../../user/infrastructure/persistence/user.repository.js';

@CommandHandler(CreateCardCommand)
export class CreateCardHandler implements ICommandHandler<CreateCardCommand> {
  constructor(
    private readonly cardRepository: CardRepository,
    private readonly userRepository: UserRepository,
    private readonly eventBus: EventBus,
    private readonly profanityCheckService: ProfanityCheckService,
  ) {}

  async execute(command: CreateCardCommand) {
    const { title, description, columnId, assignedTo, dueDate, userId } =
      command;

    const isTitleProfane = await this.profanityCheckService.isProfane(title);

    if (isTitleProfane) {
      throw new BadRequestException(
        'Card title contains inappropriate language.',
      );
    }

    const isDescriptionProfane =
      await this.profanityCheckService.isProfane(description);

    if (isDescriptionProfane) {
      throw new BadRequestException(
        'Card description contains inappropriate language.',
      );
    }

    const alreadyExists = await this.cardRepository.findByTitleAndColumnId(
      title,
      columnId,
    );

    if (alreadyExists) {
      throw new BadRequestException(
        'A card with this title already exists in the column',
      );
    }

    const isUserInTeam = await this.userRepository.isUserInTeamByColumn(
      userId,
      columnId,
    );

    if (!isUserInTeam) {
      throw new UnauthorizedException('User is not a member of the team');
    }

    const position = await this.cardRepository.getPositionForNewCard(columnId);

    const card = await this.cardRepository.create({
      title,
      description,
      columnId,
      position,
      assignedTo,
      dueDate,
    });

    const readableTeamId = await this.cardRepository.getReadableTeamIdByCardId(
      card.id,
    );

    this.eventBus.publish(new SendToTeamMembersEvent(readableTeamId));

    return card;
  }
}
