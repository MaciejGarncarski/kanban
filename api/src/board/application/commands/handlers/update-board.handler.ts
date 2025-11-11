import { BadRequestException } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { UpdateBoardCommand } from 'src/board/application/commands/update-board.command';
import { BoardAggregate } from 'src/board/domain/board.entity';
import { BoardRepository } from 'src/board/infrastructure/persistence/board.repository';
import { ProfanityCheckService } from 'src/infrastructure/services/profanity-check.service';
import { SendToTeamMembersEvent } from 'src/notifications/application/events/send-to-team-members.event';

@CommandHandler(UpdateBoardCommand)
export class UpdateBoardHandler implements ICommandHandler<UpdateBoardCommand> {
  constructor(
    private readonly boardRepository: BoardRepository,
    private readonly profanityCheckService: ProfanityCheckService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: UpdateBoardCommand): Promise<BoardAggregate> {
    const isTitleProfane = await this.profanityCheckService.isProfane(
      command.title,
    );

    if (isTitleProfane) {
      throw new BadRequestException(
        'Board title contains inappropriate language.',
      );
    }

    if (command.description) {
      const isDescriptionProfane = await this.profanityCheckService.isProfane(
        command.description,
      );

      if (isDescriptionProfane) {
        throw new BadRequestException(
          'Board description contains inappropriate language.',
        );
      }
    }

    const updated = await this.boardRepository.updateBoard({
      readableBoardId: command.readableBoardId,
      description: command.description,
      name: command.title,
    });

    this.eventBus.publish(new SendToTeamMembersEvent(updated.readableTeamId));

    return updated;
  }
}
