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
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { type Request } from 'express';
import { Auth } from '../../../auth/common/decorators/auth.decorator.js';
import { CreateColumnCommand } from '../../application/commands/create-column.command.js';
import { DeleteColumnCommand } from '../../application/commands/delete-columnd.command.js';
import { UpdateColumnCommand } from '../../application/commands/update-column.command.js';
import {
  CreateColumnRequestDto,
  createColumnRequestSchema,
  type CreateColumnRequest,
} from '../../application/dtos/create-column-request.dto.js';
import { CreateColumnResponseDto } from '../../application/dtos/create-column-response.dto.js';
import {
  deleteColumnRequestSchema,
  type DeleteColumnRequest,
} from '../../application/dtos/delete-column.request.dto.js';
import {
  updateColumnParamsSchema,
  UpdateColumnRequestDto,
  updateColumnRequestSchema,
  type UpdateColumnParams,
  type UpdateColumnRequest,
} from '../../application/dtos/update-column-request.dto.js';
import { ColumnEntity } from '../../domain/column.entity.js';
import { ApiErrorResponse } from '../../../core/application/dtos/api-error.response.dto.js';
import { routesV1 } from '../../../infrastructure/configs/app.routes.config.js';
import { TeamRole, teamRoles } from '../../../team/domain/types/team.types.js';
import { GetRoleByBoardIdQuery } from '../../../user/application/queries/get-role-by-board-id.query.js';
import { GetRoleByColumnIdQuery } from '../../../user/application/queries/get-role-by-column-id.query.js';

@Controller()
export class ColumnController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Auth()
  @Post(routesV1.column.createColumn)
  @ApiOperation({ summary: 'Create a new column' })
  @ApiOkResponse({ type: CreateColumnResponseDto })
  @ApiBadRequestResponse({
    type: ApiErrorResponse,
  })
  @ApiBody({ type: CreateColumnRequestDto })
  async createColumn(
    @Body({ schema: createColumnRequestSchema })
    createColumnDto: CreateColumnRequest,
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
  @ApiOperation({ summary: 'Update a column' })
  @ApiBody({ type: UpdateColumnRequestDto })
  @ApiBadRequestResponse({
    type: ApiErrorResponse,
  })
  async updateColumn(
    @Param({ schema: updateColumnParamsSchema }) params: UpdateColumnParams,
    @Body({ schema: updateColumnRequestSchema }) body: UpdateColumnRequest,
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
  @ApiOperation({ summary: 'Delete a column' })
  @ApiBadRequestResponse({
    type: ApiErrorResponse,
  })
  async deleteColumn(
    @Param({ schema: deleteColumnRequestSchema }) params: DeleteColumnRequest,
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
