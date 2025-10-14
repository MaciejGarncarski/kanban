import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { GetSessionQuery } from 'src/auth/application/queries/get-session.query';
import { JwtService } from '@nestjs/jwt';
import { JWTPayload } from 'src/auth/application/config/jwt-payload';
import { UserRepository } from 'src/user/user.repository';

@Injectable()
@QueryHandler(GetSessionQuery)
export class GetSessionHandler implements IQueryHandler<GetSessionQuery> {
  constructor(
    private jwtService: JwtService,
    private readonly userRepo: UserRepository,
  ) {}

  async execute(query: GetSessionQuery) {
    const decoded = this.jwtService.decode<JWTPayload>(query.token);

    const id = decoded.id;

    const user = await this.userRepo.find(id);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }
}
