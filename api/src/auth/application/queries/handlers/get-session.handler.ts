import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { GetSessionQuery } from 'src/auth/application/queries/get-session.query';

@Injectable()
@QueryHandler(GetSessionQuery)
export class SignInUserHandler implements IQueryHandler<GetSessionQuery> {
  async execute(query: GetSessionQuery): Promise<null> {
    return null;
  }
}
