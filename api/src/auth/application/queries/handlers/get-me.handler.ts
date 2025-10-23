import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { UnauthorizedException } from '@nestjs/common';
import { GetMeQuery } from 'src/auth/application/queries/get-me.query';
import { UserRepository } from 'src/user/infrastructure/persistence/user.repository';
import { plainToInstance } from 'class-transformer';
import { UserResponseDto } from 'src/user/application/dtos/user.response.dto';

@QueryHandler(GetMeQuery)
export class GetMeHandler implements IQueryHandler<GetMeQuery> {
  constructor(private readonly userRepo: UserRepository) {}

  async execute(query: GetMeQuery) {
    const user = await this.userRepo.find(query.userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }
}
