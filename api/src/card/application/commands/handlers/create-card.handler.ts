import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateCardCommand } from 'src/card/application/commands/create-card.command';
import { CardRepository } from 'src/card/infrastructure/persistence/card.repository';
import { ProfanityCheckService } from 'src/infrastructure/services/profanity-check.service';
import { UserRepository } from 'src/user/infrastructure/persistence/user.repository';

@CommandHandler(CreateCardCommand)
export class CreateCardHandler implements ICommandHandler<CreateCardCommand> {
  constructor(
    private readonly cardRepository: CardRepository,
    private readonly userRepository: UserRepository,
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

    return card;
  }
}
