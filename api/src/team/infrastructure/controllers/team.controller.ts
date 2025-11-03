import {
  Body,
  Controller,
  Delete,
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
import { type Request, type Response } from 'express';

import { Auth } from 'src/auth/common/decorators/auth.decorator';

import { ApiErrorResponse } from 'src/core/application/dtos/api-error.response.dto';
import { routesV1 } from 'src/infrastructure/configs/app.routes.config';
import { CreateTeamCommand } from 'src/team/application/commands/create-team.command';
import { DeleteTeamCommand } from 'src/team/application/commands/delete-team.command';
import { UpdateTeamCommand } from 'src/team/application/commands/update-team.command';
import { CreateTeamRequestDto } from 'src/team/application/dtos/create-team.request.dto';
import { DeleteTeamRequestDto } from 'src/team/application/dtos/delete-team.request.dto';
import { GetTeamsResponseDto } from 'src/team/application/dtos/get-teams.response.dto';
import { TeamDto } from 'src/team/application/dtos/team.dto';
import {
  UpdateTeamParamsDto,
  UpdateTeamRequestDto,
} from 'src/team/application/dtos/update-team.request.dto';
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

  @Auth()
  @Delete(routesV1.teams.deleteTeam)
  @ApiOperation({
    summary: 'Delete a team by ID',
  })
  @ApiOkResponse({
    description: 'Successfully deleted the team.',
  })
  @ApiBadRequestResponse({
    type: ApiErrorResponse,
  })
  async deleteTeam(@Req() req: Request, @Param() params: DeleteTeamRequestDto) {
    await this.commandBus.execute<DeleteTeamCommand, void>(
      new DeleteTeamCommand(req.userId, params.teamId),
    );
  }

  @Auth()
  @Patch(routesV1.teams.updateTeam)
  @ApiOperation({
    summary: 'Update a team by ID',
  })
  @ApiOkResponse({
    description: 'Successfully updated the team.',
  })
  @ApiBadRequestResponse({
    type: ApiErrorResponse,
  })
  async updateTeam(
    @Req() req: Request,
    @Param() params: UpdateTeamParamsDto,
    @Body() body: UpdateTeamRequestDto,
  ) {
    await this.commandBus.execute<UpdateTeamCommand, void>(
      new UpdateTeamCommand(
        params.teamId,
        req.userId,
        body.name,
        body.description,
        body.members,
      ),
    );
  }
}
