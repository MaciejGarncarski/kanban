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
  ApiBody,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { type Request, type Response } from 'express';

import { Auth } from '../../../auth/common/decorators/auth.decorator.js';

import { ApiErrorResponse } from '../../../core/application/dtos/api-error.response.dto.js';
import { routesV1 } from '../../../infrastructure/configs/app.routes.config.js';
import { CreateTeamCommand } from '../../application/commands/create-team.command.js';
import { DeleteTeamCommand } from '../../application/commands/delete-team.command.js';
import { UpdateTeamCommand } from '../../application/commands/update-team.command.js';
import {
  CreateTeamRequestDto,
  createTeamRequestSchema,
  type CreateTeamRequest,
} from '../../application/dtos/create-team.request.dto.js';
import {
  deleteTeamRequestSchema,
  type DeleteTeamRequest,
} from '../../application/dtos/delete-team.request.dto.js';
import { GetTeamsResponseDto } from '../../application/dtos/get-teams.response.dto.js';
import { TeamDto } from '../../application/dtos/team.dto.js';
import {
  UpdateTeamRequestDto,
  updateTeamParamsSchema,
  updateTeamRequestSchema,
  type UpdateTeamParams,
  type UpdateTeamRequest,
} from '../../application/dtos/update-team.request.dto.js';
import { GetTeamsQuery } from '../../application/queries/get-teams.query.js';

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
  @ApiBody({ type: CreateTeamRequestDto })
  async createTeam(
    @Req() req: Request,
    @Body({ schema: createTeamRequestSchema }) body: CreateTeamRequest,
  ) {
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
  async deleteTeam(
    @Req() req: Request,
    @Param({ schema: deleteTeamRequestSchema }) params: DeleteTeamRequest,
  ) {
    await this.commandBus.execute<DeleteTeamCommand, void>(
      new DeleteTeamCommand(req.userId, params.readableTeamId),
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
  @ApiBody({ type: UpdateTeamRequestDto })
  async updateTeam(
    @Req() req: Request,
    @Param({ schema: updateTeamParamsSchema }) params: UpdateTeamParams,
    @Body({ schema: updateTeamRequestSchema }) body: UpdateTeamRequest,
  ) {
    await this.commandBus.execute<UpdateTeamCommand, void>(
      new UpdateTeamCommand(
        params.readableTeamId,
        req.userId,
        body.name,
        body.description,
        body.members,
      ),
    );
  }
}
