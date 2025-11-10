import { BadRequestException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateBoardCommand } from 'src/board/application/commands/create-board.command';
import { BoardAggregate } from 'src/board/domain/board.entity';
import { BoardRepository } from 'src/board/infrastructure/persistence/board.repository';
import { ProfanityCheckService } from 'src/infrastructure/services/profanity-check.service';

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
