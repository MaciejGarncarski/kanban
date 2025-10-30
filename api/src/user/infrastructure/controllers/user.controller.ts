import { Controller, Get, Param, Req } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiBadRequestResponse, ApiOkResponse } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { type Request } from 'express';
import { Auth } from 'src/auth/common/decorators/auth.decorator';
import { ApiErrorResponse } from 'src/core/application/dtos/api-error.response.dto';
import { routesV1 } from 'src/infrastructure/configs/app.routes.config';
import { UserArrayResponseDto } from 'src/user/application/dtos/user-array.response.dto';
import { GetUsersByBoardQuery } from 'src/user/application/queries/get-users-by-board.query';
import { UserEntity } from 'src/user/domain/user.entity';

@Controller('user')
export class UserController {
  constructor(private readonly queryBus: QueryBus) {}

  @Auth()
  @Get(routesV1.user.getUsersByBoardId)
  @ApiOkResponse({
    type: UserArrayResponseDto,
  })
  @ApiBadRequestResponse({
    type: ApiErrorResponse,
  })
  async getUsers(@Param('boardId') boardId: string, @Req() req: Request) {
    const result = await this.queryBus.execute<
      GetUsersByBoardQuery,
      UserEntity[]
    >(new GetUsersByBoardQuery(boardId, req.userId));

    const usersDto = plainToInstance(
      UserArrayResponseDto,
      { users: result },
      {
        excludeExtraneousValues: true,
      },
    );
    return usersDto;
  }
}
