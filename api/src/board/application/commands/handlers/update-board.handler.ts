import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateBoardCommand } from 'src/board/application/commands/update-board.command';
import { BoardAggregate } from 'src/board/domain/board.entity';
import { BoardRepository } from 'src/board/infrastructure/persistence/board.repository';

@CommandHandler(UpdateBoardCommand)
export class UpdateBoardHandler implements ICommandHandler<UpdateBoardCommand> {
  constructor(private readonly boardRepository: BoardRepository) {}

  async execute(command: UpdateBoardCommand): Promise<BoardAggregate> {
    const updated = await this.boardRepository.updateBoard({
      boardId: command.boardId,
      description: command.description,
      name: command.title,
    });

    return updated;
  }
}
