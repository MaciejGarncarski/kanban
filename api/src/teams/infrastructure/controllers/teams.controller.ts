import { Controller, Get, HttpCode, HttpStatus, Req } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { type Request, type Response } from 'express';

import { Auth } from 'src/auth/common/decorators/auth.decorator';

import { ApiErrorResponse } from 'src/core/application/dtos/api-error.response.dto';
import { routesV1 } from 'src/infrastructure/configs/app.routes.config';
import { GetTeamsResponseDto } from 'src/teams/application/dtos/get-teams.response.dto';
import { GetTeamsQuery } from 'src/teams/application/queries/get-teams.query';

@Controller()
export class TeamsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Auth()
  @HttpCode(HttpStatus.OK)
  @Get(routesV1.teams.root)
  @ApiOperation({
    summary: 'Get all teams for the authenticated user',
  })
  @ApiOkResponse({
    type: GetTeamsResponseDto,
    description:
      'Returns a list of teams associated with the authenticated user.',
  })
  @ApiBadRequestResponse({
    type: ApiErrorResponse,
  })
  async getTeams(@Req() req: Request) {
    const teams = await this.queryBus.execute<
      GetTeamsQuery,
      GetTeamsResponseDto
    >(new GetTeamsQuery(req.userId));

    return teams;
  }
}
