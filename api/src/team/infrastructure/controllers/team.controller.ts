import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
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
import { CreateTeamCommand } from 'src/team/application/commands/create-team.command';
import { CreateTeamRequestDto } from 'src/team/application/dtos/create-team.request.dto';
import { GetTeamsResponseDto } from 'src/team/application/dtos/get-teams.response.dto';
import { TeamDto } from 'src/team/application/dtos/team.dto';
import { GetTeamsQuery } from 'src/team/application/queries/get-teams.query';

@Controller()
export class TeamController {
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

  @Auth()
  @Post(routesV1.teams.createTeam)
  @ApiOperation({
    summary: 'Get all teams for the authenticated user',
  })
  @ApiOkResponse({
    type: TeamDto,
    description:
      'Returns a list of teams associated with the authenticated user.',
  })
  @ApiBadRequestResponse({
    type: ApiErrorResponse,
  })
  async createTeam(@Req() req: Request, @Body() body: CreateTeamRequestDto) {
    const result = await this.commandBus.execute<CreateTeamCommand, TeamDto>(
      new CreateTeamCommand(
        req.userId,
        body.name,
        body.description || '',
        body.members || [],
      ),
    );

    return result;
  }
}
