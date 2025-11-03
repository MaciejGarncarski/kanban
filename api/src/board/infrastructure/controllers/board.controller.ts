import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
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
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Create a new board',
  })
  @ApiOkResponse({
    description: 'Successfully created board',
  })
  @ApiBadRequestResponse({
    type: ApiErrorResponse,
  })
  async createBoard(@Req() req: Request, @Body() body: CreateBoardRequestDto) {
    await this.commandBus.execute(
      new CreateBoardCommand(
        req.userId,
        body.teamId,
        body.name,
        body.description,
      ),
    );
  }
}
