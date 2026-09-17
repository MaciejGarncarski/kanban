import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { type Request } from 'express';
import { Auth } from '../../../auth/common/decorators/auth.decorator.js';
import { CreateCardCommand } from '../../application/commands/create-card.command.js';
import { DeleteCardCommand } from '../../application/commands/delete-card.command.js';
import { UpdateCardCommand } from '../../application/commands/update-card.command.js';
import { CardDto, cardSchema } from '../../application/dtos/card.dto.js';
import { parseResponse } from '../../../infrastructure/validation/parse-response.js';
import {
  CreateCardRequestDto,
  createCardRequestSchema,
  type CreateCardRequest,
} from '../../application/dtos/create-card.request.dto.js';
import {
  deleteCardRequestSchema,
  type DeleteCardRequest,
} from '../../application/dtos/delete-card.request.dto.js';
import {
  UpdateCardRequestDto,
  updateCardParamSchema,
  updateCardRequestSchema,
  type UpdateCardParam,
  type UpdateCardRequest,
} from '../../application/dtos/update-card-request.dto.js';
import { CardEntity } from '../../domain/card.entity.js';
import { ApiErrorResponse } from '../../../core/application/dtos/api-error.response.dto.js';
import { routesV1 } from '../../../infrastructure/configs/app.routes.config.js';

@Controller()
export class CardController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Auth()
  @Post(routesV1.card.createCard)
  @ApiBody({ type: CreateCardRequestDto })
  @ApiOperation({ summary: 'Create a new card' })
  @ApiOkResponse({
    type: CardDto,
  })
  @ApiBadRequestResponse({
    type: ApiErrorResponse,
  })
  async createCard(
    @Body({ schema: createCardRequestSchema }) body: CreateCardRequest,
    @Req() req: Request,
  ) {
    const { columnId, title, assignedTo, description, dueDate } = body;

    const result = await this.commandBus.execute<CreateCardCommand, CardEntity>(
      new CreateCardCommand(
        req.userId,
        title,
        description || '',
        columnId,
        dueDate ? new Date(dueDate) : undefined,
        assignedTo,
      ),
    );

    return parseResponse<CardDto>(cardSchema, result);
  }

  @Auth()
  @Delete(routesV1.card.deleteCard)
  @ApiOperation({ summary: 'Delete a card' })
  @ApiOkResponse({
    type: CardDto,
  })
  @ApiBadRequestResponse({
    type: ApiErrorResponse,
  })
  async deleteCard(
    @Param({ schema: deleteCardRequestSchema }) params: DeleteCardRequest,
    @Req() req: Request,
  ) {
    const result = await this.commandBus.execute<DeleteCardCommand, boolean>(
      new DeleteCardCommand(req.userId, params.cardId),
    );

    if (!result) {
      throw new Error('Card deletion failed');
    }

    return { status: 'deleted' };
  }

  @Auth()
  @Patch(routesV1.card.updateCard)
  @ApiOperation({ summary: 'Update a card' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBody({ type: UpdateCardRequestDto })
  @ApiBadRequestResponse({
    type: ApiErrorResponse,
  })
  async updateCard(
    @Param({ schema: updateCardParamSchema }) params: UpdateCardParam,
    @Body({ schema: updateCardRequestSchema }) body: UpdateCardRequest,
    @Req() req: Request,
  ) {
    const { title, description, dueDate, assignedTo, position, columnId } =
      body;

    const userId = req.userId;
    const cardId = params.cardId;

    await this.commandBus.execute(
      new UpdateCardCommand(
        userId,
        cardId,
        title,
        description,
        dueDate ? new Date(dueDate) : undefined,
        assignedTo,
        position,
        columnId,
      ),
    );
  }
}
