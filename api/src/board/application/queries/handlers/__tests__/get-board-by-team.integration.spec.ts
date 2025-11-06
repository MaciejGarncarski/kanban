import { faker } from '@faker-js/faker';
import { Test, TestingModule } from '@nestjs/testing';
import { StartedPostgreSqlContainer } from '@testcontainers/postgresql/build/postgresql-container';
import { Pool } from 'pg';
import { userFixture } from 'src/__tests__/fixtures/user.fixture';
import { createJWTService } from 'src/__tests__/utils/create-jwt-service';
import { getTestDb, stopTestDb } from 'src/__tests__/utils/get-test-db';
import { TestConfigModule } from 'src/__tests__/utils/get-test-env';
import { RefreshTokenRepository } from 'src/auth/infrastructure/persistence/refresh-token.repository';
import { GetBoardsByTeamQuery } from 'src/board/application/queries/get-boards-by-team.query';
import { GetBoardsByTeamHandler } from 'src/board/application/queries/handlers/get-boards-by-team.handler';
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

describe('get-board-by-team-handler integration', () => {
  let handler: GetBoardsByTeamHandler;
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
        GetBoardsByTeamHandler,
        BoardRepository,
        RefreshTokenRepository,
        { provide: DB_PROVIDER, useValue: db },
        { provide: RefreshTokenRepository, useValue: refreshTokenRepo },
        { provide: UserRepository, useValue: userRepo },
        createJWTService(),
      ],
    }).compile();

    handler = module.get<GetBoardsByTeamHandler>(GetBoardsByTeamHandler);
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

    const query = new GetBoardsByTeamQuery(userDb.id, newTeam.readable_id);

    // Act
    const result = await handler.execute(query);

    // Assert

    expect(result.boards).toHaveLength(1);
    expect(result.boards[0].name).toBe(newBoard.name);
    expect(result.boards[0].description).toBe(newBoard.description);
  });

  it('should return empty array if user does not belong to team', async () => {
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

    const query = new GetBoardsByTeamQuery(userDb.id, newTeam.readable_id);

    // Act & Assert
    const result = await handler.execute(query);
    expect(result.boards).toHaveLength(0);
  });

  it('should return empty array if user does not exists', async () => {
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

    const query = new GetBoardsByTeamQuery(v7(), newBoard.readable_id);

    // Act & Assert
    const result = await handler.execute(query);
    expect(result.boards).toHaveLength(0);
  });
});
