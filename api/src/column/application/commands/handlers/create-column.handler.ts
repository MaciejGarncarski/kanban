import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { CreateColumnCommand } from 'src/column/application/commands/create-column.command';
import { CreateColumnResponseDto } from 'src/column/application/dtos/create-column-response.dto';
import { ColumnRepository } from 'src/column/infrastructure/persistence/column.repository';

@CommandHandler(CreateColumnCommand)
export class CreateColumnHandler
  implements ICommandHandler<CreateColumnCommand>
{
  constructor(private readonly columnRepository: ColumnRepository) {}

  async execute(
    command: CreateColumnCommand,
  ): Promise<CreateColumnResponseDto> {
    const { title, boardId } = command;
    const created = await this.columnRepository.createColumn(boardId, title);

    return created;
  }
}
