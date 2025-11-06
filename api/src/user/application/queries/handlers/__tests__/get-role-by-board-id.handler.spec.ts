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
  boards,
  team_members,
  teams,
  users,
} from 'src/infrastructure/persistence/db/schema';
import { generateReadableId } from 'src/infrastructure/persistence/generate-readable-id';
import { teamRoles } from 'src/team/domain/types/team.types';
import { GetRoleByBoardIdQuery } from 'src/user/application/queries/get-role-by-board-id.query';
import { GetRoleByBoardIdHandler } from 'src/user/application/queries/handlers/get-role-by-board-id.handler';
import { UserRepositoryInterface } from 'src/user/domain/ports/user.interface';
import { UserRepository } from 'src/user/infrastructure/persistence/user.repository';
import { v7 } from 'uuid';

describe('GetRoleByBoardIdHandler', () => {
  let handler: GetRoleByBoardIdHandler;
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
        GetRoleByBoardIdHandler,
        { provide: DB_PROVIDER, useValue: db },
        { provide: UserRepository, useValue: userRepo },
        createJWTService(),
      ],
    }).compile();

    handler = module.get<GetRoleByBoardIdHandler>(GetRoleByBoardIdHandler);
    userRepo = module.get<UserRepositoryInterface>(UserRepository);
  });

  it('should throw unauthorized exception if user is not in team', async () => {
    const boardId = v7();
    const [team] = await db
      .insert(teams)
      .values({
        name: generateReadableId(),
        readable_id: generateReadableId(),
      })
      .returning();

    const [user] = await db
      .insert(users)
      .values({
        email: faker.internet.email(),
        password_hash: await hash(faker.internet.password()),
        name: faker.person.firstName(),
      })
      .returning();

    await db
      .insert(boards)
      .values({
        id: boardId,
        team_id: team.id,
        name: generateReadableId(),
        readable_id: generateReadableId(),
      })
      .returning();

    const query = new GetRoleByBoardIdQuery(boardId, user.id);

    await expect(handler.execute(query)).rejects.toThrow(
      'User is not authorized to access this team',
    );
  });

  it('should return user role in team', async () => {
    const teamIdReadable = generateReadableId();
    const teamId = v7();
    const role = teamRoles.ADMIN;

    await db.insert(teams).values({
      id: teamId,
      name: generateReadableId(),
      readable_id: teamIdReadable,
    });

    const [user] = await db
      .insert(users)
      .values({
        email: faker.internet.email(),
        password_hash: await hash(faker.internet.password()),
        name: faker.person.firstName(),
      })
      .returning();

    await db.insert(team_members).values({
      team_id: teamId,
      user_id: user.id,
      role: role,
    });

    const boardId = v7();

    const [board] = await db
      .insert(boards)
      .values({
        id: boardId,
        team_id: teamId,
        name: generateReadableId(),
        readable_id: generateReadableId(),
      })
      .returning();

    const query = new GetRoleByBoardIdQuery(board.readable_id, user.id);
    const result = await handler.execute(query);

    expect(result).toBe(role);
  });
});
