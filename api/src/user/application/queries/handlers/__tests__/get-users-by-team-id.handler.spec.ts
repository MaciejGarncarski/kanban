import { faker } from '@faker-js/faker';
import { Test, TestingModule } from '@nestjs/testing';
import { hash } from '@node-rs/argon2';
import { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { Pool } from 'pg';
import { createJWTService } from 'src/__tests__/utils/create-jwt-service';
import { getTestDb, stopTestDb } from 'src/__tests__/utils/get-test-db';
import { TestConfigModule } from 'src/__tests__/utils/get-test-env';
import { DB } from 'src/infrastructure/persistence/db/client';
import { DB_PROVIDER } from 'src/infrastructure/persistence/db/db.provider';
import {
  team_members,
  teams,
  users,
} from 'src/infrastructure/persistence/db/schema';
import { generateReadableId } from 'src/infrastructure/persistence/generate-readable-id';
import { teamRoles } from 'src/team/domain/types/team.types';
import { GetRoleByTeamIdQuery } from 'src/user/application/queries/get-role-by-team-id.query';
import { GetUsersByTeamIdQuery } from 'src/user/application/queries/get-users-by-team-id.query';
import { GetUsersByTeamIdHandler } from 'src/user/application/queries/handlers/get-users-by-team-id.handler';
import { UserRepositoryInterface } from 'src/user/domain/ports/user.interface';
import { UserRepository } from 'src/user/infrastructure/persistence/user.repository';
import { v7 } from 'uuid';

describe('GetUsersByTeamIdHandler', () => {
  let handler: GetUsersByTeamIdHandler;
  let userRepo: UserRepositoryInterface;
  let container: StartedPostgreSqlContainer;
  let pool: Pool;
  let db: DB;

  beforeAll(async () => {
    const { pgContainer, pgPool, testDb } = await getTestDb();
    container = pgContainer;
    pool = pgPool;

    db = testDb;
    userRepo = new UserRepository(testDb);
  });

  afterAll(async () => {
    await stopTestDb(container, pool);
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TestConfigModule],
      providers: [
        GetUsersByTeamIdHandler,
        { provide: DB_PROVIDER, useValue: db },
        { provide: UserRepository, useValue: userRepo },
        createJWTService(),
      ],
    }).compile();

    handler = module.get<GetUsersByTeamIdHandler>(GetUsersByTeamIdHandler);
    userRepo = module.get<UserRepositoryInterface>(UserRepository);
  });

  it('should throw unauthorized exception if user is not in team', async () => {
    const query = new GetRoleByTeamIdQuery(generateReadableId(), v7());

    await expect(handler.execute(query)).rejects.toThrow(
      'User is not authorized to access this team',
    );
  });

  it('should return users by team id', async () => {
    const [team] = await db
      .insert(teams)
      .values({
        id: v7(),
        name: 'Test Team 123',
        readable_id: generateReadableId(),
      })
      .returning();

    const passwordHash = await hash(faker.internet.password());

    const [user1] = await db
      .insert(users)
      .values({
        email: faker.internet.email(),
        password_hash: passwordHash,
        name: faker.person.firstName(),
      })
      .returning();

    const [user2] = await db
      .insert(users)
      .values({
        email: faker.internet.email(),
        password_hash: passwordHash,
        name: faker.person.firstName(),
      })
      .returning();

    await db.insert(team_members).values([
      {
        team_id: team.id,
        user_id: user1.id,
        role: teamRoles.MEMBER,
      },
      {
        team_id: team.id,
        user_id: user2.id,
        role: teamRoles.ADMIN,
      },
    ]);

    const query = new GetUsersByTeamIdQuery(team.readable_id, user1.id);
    const result = await handler.execute(query);

    expect(result).toHaveLength(2);
    const returnedUserIds = result.map((user) => user.id);
    expect(returnedUserIds).toContain(user1.id);
    expect(returnedUserIds).toContain(user2.id);
  });
});
