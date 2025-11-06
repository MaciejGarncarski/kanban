import { faker } from '@faker-js/faker';
import { Test, TestingModule } from '@nestjs/testing';
import { StartedPostgreSqlContainer } from '@testcontainers/postgresql/build/postgresql-container';
import { Pool } from 'pg';
import { userFixture } from 'src/__tests__/fixtures/user.fixture';
import { createJWTService } from 'src/__tests__/utils/create-jwt-service';
import { getTestDb, stopTestDb } from 'src/__tests__/utils/get-test-db';
import { TestConfigModule } from 'src/__tests__/utils/get-test-env';
import { RefreshTokenRepository } from 'src/auth/infrastructure/persistence/refresh-token.repository';
import { GetBoardByIdQuery } from 'src/board/application/queries/get-board-by-id.query';
import { GetBoardByIdHandler } from 'src/board/application/queries/handlers/get-board-by-id.handler';
import { BoardRepository } from 'src/board/infrastructure/persistence/board.repository';
import { type DB } from 'src/infrastructure/persistence/db/client';
import { DB_PROVIDER } from 'src/infrastructure/persistence/db/db.provider';
import {
  boards,
  team_members,
  teams,
} from 'src/infrastructure/persistence/db/schema';
import { generateReadableId } from 'src/infrastructure/persistence/generate-readable-id';
import { teamRoles } from 'src/team/domain/types/team.types';
import { UserRepositoryInterface } from 'src/user/domain/ports/user.interface';
import { UserRepository } from 'src/user/infrastructure/persistence/user.repository';
import { v7 } from 'uuid';

describe('get-board-by-id-handler integration', () => {
  let handler: GetBoardByIdHandler;
  let userRepo: UserRepositoryInterface;
  let refreshTokenRepo: RefreshTokenRepository;
  let container: StartedPostgreSqlContainer;
  let pool: Pool;
  let db: DB;

  beforeAll(async () => {
    const { pgContainer, pgPool, testDb } = await getTestDb();
    container = pgContainer;
    pool = pgPool;

    db = testDb;
    refreshTokenRepo = new RefreshTokenRepository(db);
    userRepo = new UserRepository(testDb);
  });

  afterAll(async () => {
    await stopTestDb(container, pool);
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TestConfigModule],
      providers: [
        GetBoardByIdHandler,
        BoardRepository,
        RefreshTokenRepository,
        { provide: DB_PROVIDER, useValue: db },
        { provide: RefreshTokenRepository, useValue: refreshTokenRepo },
        { provide: UserRepository, useValue: userRepo },
        createJWTService(),
      ],
    }).compile();

    handler = module.get<GetBoardByIdHandler>(GetBoardByIdHandler);
    userRepo = module.get<UserRepositoryInterface>(UserRepository);
  });

  it('should get board by id', async () => {
    // Arrange
    const userDb = await userRepo.findByEmail(userFixture.email);

    if (!userDb) {
      throw new Error('User not found');
    }

    const [newTeam] = await db
      .insert(teams)
      .values({
        id: v7(),
        name: faker.company.name(),
        description: faker.lorem.sentence(),
        readable_id: generateReadableId(),
      })
      .returning();

    await db.insert(team_members).values({
      team_id: newTeam.id,
      user_id: userDb.id,
      role: teamRoles.ADMIN,
    });

    const [newBoard] = await db
      .insert(boards)
      .values({
        name: faker.lorem.words(3),
        description: faker.lorem.sentence(),
        team_id: newTeam.id,
        readable_id: generateReadableId(),
      })
      .returning();

    const query = new GetBoardByIdQuery(userDb.id, newBoard.readable_id);

    // Act
    const result = await handler.execute(query);

    // Assert

    expect(result).toBeDefined();
    expect(result.name).toBe(newBoard.name);
    expect(result.description).toBe(newBoard.description);
    expect(result.readableTeamId).toBe(newTeam.readable_id);
  });

  it('should throw not found error if user does not belong to team', async () => {
    // Arrange
    const userDb = await userRepo.findByEmail(userFixture.email);

    if (!userDb) {
      throw new Error('User not found');
    }

    const [newTeam] = await db
      .insert(teams)
      .values({
        id: v7(),
        name: faker.company.name(),
        description: faker.lorem.sentence(),
        readable_id: generateReadableId(),
      })
      .returning();

    const [newBoard] = await db
      .insert(boards)
      .values({
        name: faker.lorem.words(3),
        description: faker.lorem.sentence(),
        team_id: newTeam.id,
        readable_id: generateReadableId(),
      })
      .returning();

    const query = new GetBoardByIdQuery(userDb.id, newBoard.readable_id);

    // Act & Assert
    await expect(handler.execute(query)).rejects.toThrow('Board not found');
  });

  it('should throw not found error if user does not exists', async () => {
    // Arrange

    const [newTeam] = await db
      .insert(teams)
      .values({
        id: v7(),
        name: faker.company.name(),
        description: faker.lorem.sentence(),
        readable_id: generateReadableId(),
      })
      .returning();

    const [newBoard] = await db
      .insert(boards)
      .values({
        name: faker.lorem.words(3),
        description: faker.lorem.sentence(),
        team_id: newTeam.id,
        readable_id: generateReadableId(),
      })
      .returning();

    const query = new GetBoardByIdQuery(v7(), newBoard.readable_id);

    // Act & Assert
    await expect(handler.execute(query)).rejects.toThrow('Board not found');
  });
});
