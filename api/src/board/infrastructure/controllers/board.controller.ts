import { Controller, Get, HttpCode, HttpStatus, Param } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { Auth } from 'src/auth/common/decorators/auth.decorator';
import { BoardDetailDto } from 'src/board/application/dtos/board-detail.dto';
import { GetBoardByIdDto } from 'src/board/application/dtos/ger-board-by-id.request.dto';
import { GetBoardsByTeamRequestDto } from 'src/board/application/dtos/get-boards-by-team.request.dto';
import { GetBoardsByTeamResponseDto } from 'src/board/application/dtos/get-boards-by-team.response.dto';
import { GetBoardByIdQuery } from 'src/board/application/queries/get-board-by-id-query';
import { GetBoardsByTeamQuery } from 'src/board/application/queries/get-boards-by-team.query';
import { ApiErrorResponse } from 'src/core/application/dtos/api-error.response.dto';
import { routesV1 } from 'src/infrastructure/configs/app.routes.config';

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
}
