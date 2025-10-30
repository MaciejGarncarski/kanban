import { BadRequestException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
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

    const alreadyExists = await this.columnRepository.existsByNameAndBoardId(
      title,
      boardId,
    );

    if (alreadyExists) {
      throw new BadRequestException(
        'Column with this name already exists in the board.',
      );
    }

    const maxColumnsReached =
      await this.columnRepository.checkMaxColumns(boardId);

    if (maxColumnsReached) {
      throw new BadRequestException(
        'Maximum number of columns reached for this board.',
      );
    }

    const created = await this.columnRepository.createColumn(boardId, title);

    const dto = plainToInstance(CreateColumnResponseDto, created, {
      excludeExtraneousValues: true,
    });

    return dto;
  }
}
