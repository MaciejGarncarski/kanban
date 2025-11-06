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
  columns,
  team_members,
  teams,
  users,
} from 'src/infrastructure/persistence/db/schema';
import { generateReadableId } from 'src/infrastructure/persistence/generate-readable-id';
import { teamRoles } from 'src/team/domain/types/team.types';
import { GetRoleByColumnIdQuery } from 'src/user/application/queries/get-role-by-column-id.query';
import { GetRoleByColumnIdHandler } from 'src/user/application/queries/handlers/get-role-by-column-id.handler';
import { UserRepositoryInterface } from 'src/user/domain/ports/user.interface';
import { UserRepository } from 'src/user/infrastructure/persistence/user.repository';
import { v7 } from 'uuid';

describe('GetRoleByColumnIdHandler', () => {
  let handler: GetRoleByColumnIdHandler;
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
        GetRoleByColumnIdHandler,
        { provide: DB_PROVIDER, useValue: db },
        { provide: UserRepository, useValue: userRepo },
        createJWTService(),
      ],
    }).compile();

    handler = module.get<GetRoleByColumnIdHandler>(GetRoleByColumnIdHandler);
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

    await db.insert(boards).values({
      id: boardId,
      team_id: team.id,
      name: generateReadableId(),
      readable_id: generateReadableId(),
    });

    const [column] = await db
      .insert(columns)
      .values({
        board_id: boardId,
        name: generateReadableId(),
        position: 0,
      })
      .returning();

    const query = new GetRoleByColumnIdQuery(column.id, user.id);

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

    await db.insert(boards).values({
      id: boardId,
      team_id: teamId,
      name: generateReadableId(),
      readable_id: generateReadableId(),
    });

    const [column] = await db
      .insert(columns)
      .values({
        board_id: boardId,
        name: generateReadableId(),
        position: 0,
      })
      .returning();

    const query = new GetRoleByColumnIdQuery(column.id, user.id);
    const result = await handler.execute(query);

    expect(result).toBe(role);
  });
});
