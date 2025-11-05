import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateBoardCommand } from 'src/board/application/commands/create-board.command';
import { BoardAggregate } from 'src/board/domain/board.entity';
import { BoardRepository } from 'src/board/infrastructure/persistence/board.repository';

@CommandHandler(CreateBoardCommand)
export class CreateBoardHandler implements ICommandHandler<CreateBoardCommand> {
  constructor(private readonly boardRepository: BoardRepository) {}

  async execute(command: CreateBoardCommand): Promise<BoardAggregate> {
    const { userId, description, name, teamId } = command;

    const created = await this.boardRepository.createBoard({
      description,
      name,
      teamId,
      userId,
    });

    return created;
  }
}
