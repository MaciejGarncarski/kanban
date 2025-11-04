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
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { Auth } from 'src/auth/common/decorators/auth.decorator';
import { DeleteBoardCommand } from 'src/board/application/commands/delete-board.command';
import { BoardDetailDto } from 'src/board/application/dtos/board-detail.dto';
import { DeleteBoardRequestDto } from 'src/board/application/dtos/delete-board.request.dto';
import { GetBoardByIdDto } from 'src/board/application/dtos/ger-board-by-id.request.dto';
import { GetBoardsByTeamRequestDto } from 'src/board/application/dtos/get-boards-by-team.request.dto';
import { GetBoardsByTeamResponseDto } from 'src/board/application/dtos/get-boards-by-team.response.dto';
import { GetBoardByIdQuery } from 'src/board/application/queries/get-board-by-id-query';
import { GetBoardsByTeamQuery } from 'src/board/application/queries/get-boards-by-team.query';
import { ApiErrorResponse } from 'src/core/application/dtos/api-error.response.dto';
import { routesV1 } from 'src/infrastructure/configs/app.routes.config';
import { type Request } from 'express';
import { CreateBoardRequestDto } from 'src/board/application/dtos/create-board.request.dto';
import { CreateBoardCommand } from 'src/board/application/commands/create-board.command';
import { BoardAggregate } from 'src/board/domain/board.entity';
import { plainToInstance } from 'class-transformer';
import { BoardSummaryDto } from 'src/board/application/dtos/board-summary.dto';
import {
  UpdateBoardParamsDto,
  UpdateBoardRequestDto,
} from 'src/board/application/dtos/update-board.request.dto';
import { UpdateBoardCommand } from 'src/board/application/commands/update-board.command';
import { GetRoleByBoardIdQuery } from 'src/user/application/queries/get-role-by-board-id.query';
import { TeamRole, teamRoles } from 'src/team/domain/types/team.types';

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
    @Param() params: GetBoardsByTeamRequestDto,
  ): Promise<GetBoardsByTeamResponseDto> {
    const data = await this.queryBus.execute<
      GetBoardsByTeamQuery,
      GetBoardsByTeamResponseDto
    >(new GetBoardsByTeamQuery(params.teamId));

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
    @Param() params: GetBoardByIdDto,
  ): Promise<BoardDetailDto> {
    const board = await this.queryBus.execute<
      GetBoardByIdQuery,
      BoardDetailDto
    >(new GetBoardByIdQuery(params.boardId));

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
    @Param()
    params: DeleteBoardRequestDto,
    @Req() req: Request,
  ): Promise<void> {
    await this.commandBus.execute(
      new DeleteBoardCommand(params.boardId, req.userId),
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
  @ApiBadRequestResponse({
    type: ApiErrorResponse,
  })
  async createBoard(@Req() req: Request, @Body() body: CreateBoardRequestDto) {
    const created = await this.commandBus.execute<
      CreateBoardCommand,
      BoardAggregate
    >(
      new CreateBoardCommand(
        req.userId,
        body.teamId,
        body.name,
        body.description,
      ),
    );

    return plainToInstance(BoardSummaryDto, created);
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
  @ApiBadRequestResponse({
    type: ApiErrorResponse,
  })
  async updateBoard(
    @Param() params: UpdateBoardParamsDto,
    @Body() body: UpdateBoardRequestDto,
    @Req() req: Request,
  ) {
    const userRole = await this.queryBus.execute<
      GetRoleByBoardIdQuery,
      TeamRole
    >(new GetRoleByBoardIdQuery(params.boardId, req.userId));

    if (userRole !== teamRoles.ADMIN) {
      throw new ForbiddenException('User is not authorized to create a column');
    }

    const result = await this.commandBus.execute<
      UpdateBoardCommand,
      BoardAggregate
    >(new UpdateBoardCommand(params.boardId, body.name, body.description));

    return plainToInstance(BoardSummaryDto, result);
  }
}
