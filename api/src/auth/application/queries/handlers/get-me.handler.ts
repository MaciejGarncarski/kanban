import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { UnauthorizedException } from '@nestjs/common';
import { GetMeQuery } from '../get-me.query.js';
import { UserRepository } from '../../../../user/infrastructure/persistence/user.repository.js';
import {
  UserResponseDto,
  userResponseSchema,
} from '../../../../user/application/dtos/user.response.dto.js';
import { parseResponse } from '../../../../infrastructure/validation/parse-response.js';

@QueryHandler(GetMeQuery)
export class GetMeHandler implements IQueryHandler<GetMeQuery> {
  constructor(private readonly userRepo: UserRepository) {}

  async execute(query: GetMeQuery) {
    const user = await this.userRepo.find(query.userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return parseResponse<UserResponseDto>(userResponseSchema, user);
  }
}
