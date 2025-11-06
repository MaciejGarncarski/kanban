import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBadRequestResponse, ApiBody, ApiOkResponse } from '@nestjs/swagger';
import { type Request } from 'express';
import { Auth } from 'src/auth/common/decorators/auth.decorator';
import { CreateColumnCommand } from 'src/column/application/commands/create-column.command';
import { DeleteColumnCommand } from 'src/column/application/commands/delete-columnd.command';
import { UpdateColumnCommand } from 'src/column/application/commands/update-column.command';
import { CreateColumnRequestDto } from 'src/column/application/dtos/create-column-request.dto';
import { CreateColumnResponseDto } from 'src/column/application/dtos/create-column-response.dto';
import { DeleteColumnRequestDto } from 'src/column/application/dtos/delete-column.request.dto';
import {
  UpdateColumnParamsDto,
  UpdateColumnRequestDto,
} from 'src/column/application/dtos/update-column-request.dto';
import { ColumnEntity } from 'src/column/domain/column.entity';
import { ApiErrorResponse } from 'src/core/application/dtos/api-error.response.dto';
import { routesV1 } from 'src/infrastructure/configs/app.routes.config';
import { TeamRole, teamRoles } from 'src/team/domain/types/team.types';
import { GetRoleByBoardIdQuery } from 'src/user/application/queries/get-role-by-board-id.query';
import { GetRoleByColumnIdQuery } from 'src/user/application/queries/get-role-by-column-id.query';

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
  @ApiBody({ type: CreateColumnRequestDto })
  async createColumn(
    @Body() createColumnDto: CreateColumnRequestDto,
    @Req() req: Request,
  ) {
    const userId = req.userId;
    const userRole = await this.queryBus.execute<
      GetRoleByBoardIdQuery,
      TeamRole
    >(new GetRoleByBoardIdQuery(createColumnDto.readableBoardId, userId));

    if (userRole !== teamRoles.ADMIN) {
      throw new ForbiddenException('User is not authorized to create a column');
    }

    const result = await this.commandBus.execute<
      CreateColumnCommand,
      CreateColumnResponseDto
    >(
      new CreateColumnCommand(
        createColumnDto.title,
        createColumnDto.readableBoardId,
      ),
    );

    return result;
  }

  @Auth()
  @Patch(routesV1.column.updateColumn)
  @ApiOkResponse({ type: CreateColumnResponseDto })
  @ApiBadRequestResponse({
    type: ApiErrorResponse,
  })
  async updateColumn(
    @Param() params: UpdateColumnParamsDto,
    @Body() body: UpdateColumnRequestDto,
    @Req() req: Request,
  ) {
    const userId = req.userId;
    const { position, name } = body;

    const result = await this.commandBus.execute<
      UpdateColumnCommand,
      ColumnEntity
    >(new UpdateColumnCommand(userId, params.columnId, name, position));

    return result;
  }

  @Auth()
  @Delete(routesV1.column.deleteColumn)
  @ApiBadRequestResponse({
    type: ApiErrorResponse,
  })
  async deleteColumn(
    @Param() params: DeleteColumnRequestDto,
    @Req() req: Request,
  ) {
    const userId = req.userId;

    const userRole = await this.queryBus.execute<
      GetRoleByColumnIdQuery,
      TeamRole
    >(new GetRoleByColumnIdQuery(params.columnId, userId));

    if (userRole !== teamRoles.ADMIN) {
      throw new ForbiddenException(
        'User is not authorized to delete this team',
      );
    }

    await this.commandBus.execute(new DeleteColumnCommand(params.columnId));
  }
}
