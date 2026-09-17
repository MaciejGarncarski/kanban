import { Controller, Get, Param, Req } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { z } from 'zod';
import { type Request } from 'express';
import { Auth } from '../../../auth/common/decorators/auth.decorator.js';
import { ApiErrorResponse } from '../../../core/application/dtos/api-error.response.dto.js';
import { routesV1 } from '../../../infrastructure/configs/app.routes.config.js';
import {
  RoleResponseDto,
  roleResponseSchema,
} from '../../application/dtos/role.response.dto.js';
import {
  UserArrayResponseDto,
  userArrayResponseSchema,
} from '../../application/dtos/user-array.response.dto.js';
import { parseResponse } from '../../../infrastructure/validation/parse-response.js';
import { GetAllUsersQuery } from '../../application/queries/get-all-users.query.js';
import { GetRoleByTeamIdQuery } from '../../application/queries/get-role-by-team-id.query.js';
import { GetUsersByTeamIdQuery } from '../../application/queries/get-users-by-team-id.query.js';
import { UserEntity } from '../../domain/user.entity.js';

@Controller()
export class UserController {
  constructor(private readonly queryBus: QueryBus) {}

  @Auth()
  @Get(routesV1.user.getAllUsers)
  @ApiOperation({ summary: 'Get all users' })
  @ApiOkResponse({
    type: UserArrayResponseDto,
  })
  @ApiBadRequestResponse({
    type: ApiErrorResponse,
  })
  async getAllUsers() {
    const result = await this.queryBus.execute<GetAllUsersQuery, UserEntity[]>(
      new GetAllUsersQuery(),
    );

    const usersDto = parseResponse<UserArrayResponseDto>(
      userArrayResponseSchema,
      { users: result },
    );

    return usersDto;
  }

  @Auth()
  @Get(routesV1.user.getUsersByTeamId)
  @ApiOperation({ summary: 'Get users by readable team ID' })
  @ApiOkResponse({
    type: UserArrayResponseDto,
  })
  @ApiBadRequestResponse({
    type: ApiErrorResponse,
  })
  async getUsers(
    @Param('readableTeamId', { schema: z.string() }) readableTeamId: string,
    @Req() req: Request,
  ) {
    const result = await this.queryBus.execute<
      GetUsersByTeamIdQuery,
      UserEntity[]
    >(new GetUsersByTeamIdQuery(readableTeamId, req.userId));

    const usersDto = parseResponse<UserArrayResponseDto>(
      userArrayResponseSchema,
      { users: result },
    );
    return usersDto;
  }

  @Auth()
  @Get(routesV1.user.getRoleByTeamId)
  @ApiOperation({ summary: 'Get user role by readable team ID' })
  @ApiOkResponse({
    type: RoleResponseDto,
  })
  @ApiBadRequestResponse({
    type: ApiErrorResponse,
  })
  async getRoleByTeamId(
    @Param('readableTeamId', { schema: z.string() }) readableTeamId: string,
    @Req() req: Request,
  ) {
    const result = await this.queryBus.execute<GetRoleByTeamIdQuery, string>(
      new GetRoleByTeamIdQuery(readableTeamId, req.userId),
    );

    const roleDto = parseResponse<RoleResponseDto>(roleResponseSchema, {
      role: result,
    });

    return roleDto;
  }
}
