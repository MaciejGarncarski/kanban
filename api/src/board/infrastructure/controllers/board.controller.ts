import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
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
import { Auth } from '../../../auth/common/decorators/auth.decorator.js';
import { DeleteBoardCommand } from '../../application/commands/delete-board.command.js';
import { BoardDetailDto } from '../../application/dtos/board-detail.dto.js';
import {
  deleteBoardRequestSchema,
  type DeleteBoardRequest,
} from '../../application/dtos/delete-board.request.dto.js';
import {
  getBoardByIdRequestSchema,
  type GetBoardByIdRequest,
} from '../../application/dtos/ger-board-by-id.request.dto.js';
import {
  getBoardsByTeamRequestSchema,
  type GetBoardsByTeamRequest,
} from '../../application/dtos/get-boards-by-team.request.dto.js';
import { GetBoardsByTeamResponseDto } from '../../application/dtos/get-boards-by-team.response.dto.js';
import { GetBoardByIdQuery } from '../../application/queries/get-board-by-id.query.js';
import { GetBoardsByTeamQuery } from '../../application/queries/get-boards-by-team.query.js';
import { ApiErrorResponse } from '../../../core/application/dtos/api-error.response.dto.js';
import { routesV1 } from '../../../infrastructure/configs/app.routes.config.js';
import { type Request } from 'express';
import {
  CreateBoardRequestDto,
  createBoardRequestSchema,
  type CreateBoardRequest,
} from '../../application/dtos/create-board.request.dto.js';
import { CreateBoardCommand } from '../../application/commands/create-board.command.js';
import { BoardAggregate } from '../../domain/board.entity.js';
import {
  BoardSummaryDto,
  boardSummarySchema,
} from '../../application/dtos/board-summary.dto.js';
import { parseResponse } from '../../../infrastructure/validation/parse-response.js';
import {
  UpdateBoardRequestDto,
  updateBoardParamsSchema,
  updateBoardRequestSchema,
  type UpdateBoardParams,
  type UpdateBoardRequest,
} from '../../application/dtos/update-board.request.dto.js';
import { UpdateBoardCommand } from '../../application/commands/update-board.command.js';
import { GetRoleByBoardIdQuery } from '../../../user/application/queries/get-role-by-board-id.query.js';
import { TeamRole, teamRoles } from '../../../team/domain/types/team.types.js';

@Controller()
export class BoardController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Auth()
  @Get(routesV1.board.getBoardsByTeamId)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all boards by team ID',
  })
  @ApiOkResponse({
    type: GetBoardsByTeamResponseDto,
    description: 'Successfully retrieved boards for the team',
  })
  @ApiBadRequestResponse({
    type: ApiErrorResponse,
  })
  async getAllBoardsByTeamId(
    @Param({ schema: getBoardsByTeamRequestSchema })
    params: GetBoardsByTeamRequest,
    @Req() req: Request,
  ): Promise<GetBoardsByTeamResponseDto> {
    const data = await this.queryBus.execute<
      GetBoardsByTeamQuery,
      GetBoardsByTeamResponseDto
    >(new GetBoardsByTeamQuery(req.userId, params.readableTeamId));

    return { boards: data.boards };
  }

  @Auth()
  @Get(routesV1.board.getBoardById)
  @ApiOperation({
    summary: 'Get board by ID',
  })
  @ApiOkResponse({
    type: BoardDetailDto,
    description: 'Successfully retrieved board',
  })
  @ApiBadRequestResponse({
    type: ApiErrorResponse,
  })
  async getBoardById(
    @Param({ schema: getBoardByIdRequestSchema }) params: GetBoardByIdRequest,
    @Req() req: Request,
  ): Promise<BoardDetailDto> {
    const userId = req.userId;

    const board = await this.queryBus.execute<
      GetBoardByIdQuery,
      BoardDetailDto
    >(new GetBoardByIdQuery(userId, params.readableBoardId));

    return board;
  }

  @Auth()
  @Delete(routesV1.board.deleteBoard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete board by ID',
  })
  @ApiOkResponse({
    description: 'Successfully deleted board',
  })
  @ApiBadRequestResponse({
    type: ApiErrorResponse,
  })
  async deleteBoardById(
    @Param({ schema: deleteBoardRequestSchema }) params: DeleteBoardRequest,
    @Req() req: Request,
  ): Promise<void> {
    await this.commandBus.execute(
      new DeleteBoardCommand(params.readableBoardId, req.userId),
    );
  }

  @Auth()
  @Post(routesV1.board.createBoard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Create a new board',
  })
  @ApiOkResponse({
    type: BoardSummaryDto,
    description: 'Successfully created board',
  })
  @ApiBody({ type: CreateBoardRequestDto })
  @ApiBadRequestResponse({
    type: ApiErrorResponse,
  })
  async createBoard(
    @Req() req: Request,
    @Body({ schema: createBoardRequestSchema }) body: CreateBoardRequest,
  ) {
    const created = await this.commandBus.execute<
      CreateBoardCommand,
      BoardAggregate
    >(
      new CreateBoardCommand(
        req.userId,
        body.readableTeamId,
        body.name,
        body.description,
      ),
    );

    return parseResponse<BoardSummaryDto>(boardSummarySchema, created);
  }

  @Auth()
  @Patch(routesV1.board.updateBoard)
  @ApiOperation({
    summary: 'Update board',
  })
  @ApiOkResponse({
    type: BoardSummaryDto,
    description: 'Successfully updated board',
  })
  @ApiBody({ type: UpdateBoardRequestDto })
  @ApiBadRequestResponse({
    type: ApiErrorResponse,
  })
  async updateBoard(
    @Param({ schema: updateBoardParamsSchema }) params: UpdateBoardParams,
    @Body({ schema: updateBoardRequestSchema }) body: UpdateBoardRequest,
    @Req() req: Request,
  ) {
    const userRole = await this.queryBus.execute<
      GetRoleByBoardIdQuery,
      TeamRole
    >(new GetRoleByBoardIdQuery(params.readableBoardId, req.userId));

    if (userRole !== teamRoles.ADMIN) {
      throw new ForbiddenException('User is not authorized to create a column');
    }

    const result = await this.commandBus.execute<
      UpdateBoardCommand,
      BoardAggregate
    >(
      new UpdateBoardCommand(
        params.readableBoardId,
        body.name,
        body.description,
      ),
    );

    return parseResponse<BoardSummaryDto>(boardSummarySchema, result);
  }
}
