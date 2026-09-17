import { BadRequestException } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { CreateColumnCommand } from '../create-column.command.js';
import {
  CreateColumnResponseDto,
  createColumnResponseSchema,
} from '../../dtos/create-column-response.dto.js';
import { parseResponse } from '../../../../infrastructure/validation/parse-response.js';
import { ColumnRepository } from '../../../infrastructure/persistence/column.repository.js';
import { ProfanityCheckService } from '../../../../infrastructure/services/profanity-check.service.js';
import { SendToTeamMembersEvent } from '../../../../notifications/application/events/send-to-team-members.event.js';

@CommandHandler(CreateColumnCommand)
export class CreateColumnHandler implements ICommandHandler<CreateColumnCommand> {
  constructor(
    private readonly columnRepository: ColumnRepository,
    private readonly eventBus: EventBus,
    private readonly profanityCheckService: ProfanityCheckService,
  ) {}

  async execute(
    command: CreateColumnCommand,
  ): Promise<CreateColumnResponseDto> {
    const { title, readableBoardId } = command;

    const isTitleProfane = await this.profanityCheckService.isProfane(title);

    if (isTitleProfane) {
      throw new BadRequestException(
        'Column title contains inappropriate language.',
      );
    }

    const alreadyExists = await this.columnRepository.existsByNameAndBoardId(
      title,
      readableBoardId,
    );

    if (alreadyExists) {
      throw new BadRequestException(
        'Column with this name already exists in the board.',
      );
    }

    const maxColumnsReached =
      await this.columnRepository.checkMaxColumns(readableBoardId);

    if (maxColumnsReached) {
      throw new BadRequestException(
        'Maximum number of columns reached for this board.',
      );
    }

    const created = await this.columnRepository.createColumn(
      readableBoardId,
      title,
    );

    const dto = parseResponse<CreateColumnResponseDto>(
      createColumnResponseSchema,
      created,
    );

    const readableTeamId =
      await this.columnRepository.findReadableTeamIdByColumnId(created.id);

    this.eventBus.publish(new SendToTeamMembersEvent(readableTeamId));

    return dto;
  }
}
