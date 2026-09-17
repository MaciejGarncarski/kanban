import { BadRequestException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateBoardCommand } from '../create-board.command.js';
import { BoardAggregate } from '../../../domain/board.entity.js';
import { BoardRepository } from '../../../infrastructure/persistence/board.repository.js';
import { ProfanityCheckService } from '../../../../infrastructure/services/profanity-check.service.js';

@CommandHandler(CreateBoardCommand)
export class CreateBoardHandler implements ICommandHandler<CreateBoardCommand> {
  constructor(
    private readonly boardRepository: BoardRepository,
    private readonly profanityCheckService: ProfanityCheckService,
  ) {}

  async execute(command: CreateBoardCommand): Promise<BoardAggregate> {
    const { userId, description, name, readableTeamId } = command;

    const isNameProfane = await this.profanityCheckService.isProfane(name);

    if (isNameProfane) {
      throw new BadRequestException(
        'Board name contains inappropriate language.',
      );
    }

    const isDescriptionProfane =
      await this.profanityCheckService.isProfane(description);

    if (isDescriptionProfane) {
      throw new BadRequestException(
        'Board description contains inappropriate language.',
      );
    }

    const created = await this.boardRepository.createBoard({
      description,
      name,
      readableTeamId,
      userId,
    });

    return created;
  }
}
