import { Body, Controller, Post, Req } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiBadRequestResponse, ApiBody, ApiOkResponse } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { type Request } from 'express';
import { Auth } from 'src/auth/common/decorators/auth.decorator';
import { CreateCardCommand } from 'src/card/application/commands/create-card.command';
import { CardDto } from 'src/card/application/dtos/card.dto';
import { CreateCardRequestDto } from 'src/card/application/dtos/create-card.request.dto';
import { CardEntity } from 'src/card/domain/card.entity';
import { ApiErrorResponse } from 'src/core/application/dtos/api-error.response.dto';
import { routesV1 } from 'src/infrastructure/configs/app.routes.config';

@Controller()
export class CardController {
  constructor(private readonly commandBus: CommandBus) {}

  @Auth()
  @Post(routesV1.card.createCard)
  @ApiBody({ type: CreateCardRequestDto })
  @ApiOkResponse({
    type: CardDto,
  })
  @ApiBadRequestResponse({
    type: ApiErrorResponse,
  })
  async createCard(@Body() body: CreateCardRequestDto, @Req() req: Request) {
    const { columnId, title, assignedTo, description, dueDate } = body;

    const result = this.commandBus.execute<CreateCardCommand, CardEntity>(
      new CreateCardCommand(
        req.userId,
        title,
        description || '',
        columnId,
        dueDate ? new Date(dueDate) : undefined,
        assignedTo,
      ),
    );

    return plainToInstance(CardDto, result, {
      excludeExtraneousValues: true,
    });
  }
}
