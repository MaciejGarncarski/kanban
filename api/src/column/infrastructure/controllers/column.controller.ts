import { Body, Controller, Post, SerializeOptions } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBadRequestResponse, ApiBody, ApiOkResponse } from '@nestjs/swagger';
import { Auth } from 'src/auth/common/decorators/auth.decorator';
import { CreateColumnCommand } from 'src/column/application/commands/create-column.command';
import { CreateColumnRequestDto } from 'src/column/application/dtos/create-column-request.dto';
import { CreateColumnResponseDto } from 'src/column/application/dtos/create-column-response.dto';
import { ApiErrorResponse } from 'src/core/application/dtos/api-error.response.dto';
import { routesV1 } from 'src/infrastructure/configs/app.routes.config';

@Controller()
export class ColumnController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Auth()
  @Post(routesV1.column.createColumn)
  @ApiOkResponse({ type: CreateColumnResponseDto })
  @ApiBadRequestResponse({
    type: ApiErrorResponse,
  })
  @SerializeOptions({})
  @ApiBody({ type: CreateColumnRequestDto })
  async createColumn(@Body() createColumnDto: CreateColumnRequestDto) {
    const result = await this.commandBus.execute<
      CreateColumnCommand,
      CreateColumnResponseDto
    >(new CreateColumnCommand(createColumnDto.title, createColumnDto.boardId));

    return result;
  }
}
