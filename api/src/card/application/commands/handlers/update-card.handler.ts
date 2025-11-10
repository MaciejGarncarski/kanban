import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CommandHandler, QueryBus } from '@nestjs/cqrs';
import { UpdateCardCommand } from 'src/card/application/commands/update-card.command';
import { CardEntity } from 'src/card/domain/card.entity';
import { CardRepository } from 'src/card/infrastructure/persistence/card.repository';
import { ProfanityCheckService } from 'src/infrastructure/services/profanity-check.service';
import { TeamRole, teamRoles } from 'src/team/domain/types/team.types';
import { GetRoleByColumnIdQuery } from 'src/user/application/queries/get-role-by-column-id.query';

@CommandHandler(UpdateCardCommand)
export class UpdateCardHandler {
  constructor(
    private readonly cardRepo: CardRepository,
    private readonly queryBus: QueryBus,
    private readonly profanityCheckService: ProfanityCheckService,
  ) {}

  async execute(command: UpdateCardCommand) {
    const {
      title,
      description,
      dueDate,
      assignedTo,
      position,
      columnId,
      cardId,
      userId,
    } = command;

    const cardToMove = await this.cardRepo.findById(cardId);

    if (!cardToMove) {
      throw new NotFoundException('Card not found');
    }

    const role = await this.queryBus.execute<GetRoleByColumnIdQuery, TeamRole>(
      new GetRoleByColumnIdQuery(cardToMove.columnId, userId),
    );

    if (title) {
      const isTitleProfane = await this.profanityCheckService.isProfane(title);

      if (isTitleProfane) {
        throw new BadRequestException(
          'Card title contains inappropriate language.',
        );
      }
    }

    if (description) {
      const isDescriptionProfane =
        await this.profanityCheckService.isProfane(description);

      if (isDescriptionProfane) {
        throw new BadRequestException(
          'Card description contains inappropriate language.',
        );
      }
    }

    if (position !== undefined) {
      if (columnId && columnId === cardToMove.columnId) {
        const allCards = await this.cardRepo.findAllByColumnId(columnId);
        const filtered = allCards.filter((c) => c.id !== cardId);
        const currentCard = allCards.find((c) => c.id === cardId);

        if (!currentCard) {
          throw new NotFoundException('Card not found in the specified column');
        }

        let insertIndex = position - 1;

        if (currentCard.position < position) {
          insertIndex -= 1;
        }

        if (insertIndex < 0) insertIndex = 0;
        if (insertIndex > filtered.length) insertIndex = filtered.length;

        filtered.splice(insertIndex, 0, cardToMove);

        await Promise.all(
          filtered.map((c, idx) =>
            this.cardRepo.updateCard(
              new CardEntity({ ...c, position: idx + 1 }),
            ),
          ),
        );
        return;
      }

      if (columnId && columnId !== cardToMove.columnId) {
        const sourceCards = await this.cardRepo.findAllByColumnId(
          cardToMove.columnId,
        );
        const sourceFiltered = sourceCards.filter((c) => c.id !== cardId);

        await Promise.all(
          sourceFiltered.map((c, idx) =>
            this.cardRepo.updateCard(
              new CardEntity({ ...c, position: idx + 1 }),
            ),
          ),
        );

        const targetCards = await this.cardRepo.findAllByColumnId(columnId);
        const insertIndex = Math.max(
          0,
          Math.min(position - 1, targetCards.length),
        );
        targetCards.splice(
          insertIndex,
          0,
          new CardEntity({ ...cardToMove, columnId }),
        );

        await Promise.all(
          targetCards.map((c, idx) =>
            this.cardRepo.updateCard(
              new CardEntity({ ...c, position: idx + 1 }),
            ),
          ),
        );

        return;
      }
    }

    if (role !== teamRoles.ADMIN) {
      throw new UnauthorizedException(
        'Only admins can update card details other than position.',
      );
    }

    const updatedCard = new CardEntity({
      ...cardToMove,
      title: title ?? cardToMove.title,
      description: description ?? cardToMove.description,
      dueDate: dueDate ?? cardToMove.dueDate,
      assignedTo: assignedTo ?? cardToMove.assignedTo,
      position: position ?? cardToMove.position,
      columnId: columnId ?? cardToMove.columnId,
    });

    await this.cardRepo.updateCard(updatedCard);
  }
}
