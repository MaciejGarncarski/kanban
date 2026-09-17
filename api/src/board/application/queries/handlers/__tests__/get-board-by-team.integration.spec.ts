import { faker } from '@faker-js/faker';
import { Test, TestingModule } from '@nestjs/testing';
import { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { Pool } from 'pg';
import { userFixture } from '../../../../../__tests__/fixtures/user.fixture.js';
import { createJWTService } from '../../../../../__tests__/utils/create-jwt-service.js';
import {
  getTestDb,
  stopTestDb,
} from '../../../../../__tests__/utils/get-test-db.js';
import { TestConfigModule } from '../../../../../__tests__/utils/get-test-env.js';
import { GetBoardsByTeamQuery } from '../../get-boards-by-team.query.js';
import { GetBoardsByTeamHandler } from '../get-boards-by-team.handler.js';
import { BoardRepository } from '../../../../infrastructure/persistence/board.repository.js';
import { type DB } from '../../../../../infrastructure/persistence/db/client.js';
import { DB_PROVIDER } from '../../../../../infrastructure/persistence/db/db.provider.js';
import {
  boards,
  team_members,
  teams,
} from '../../../../../infrastructure/persistence/db/schema.js';
import { generateReadableId } from '../../../../../infrastructure/persistence/generate-readable-id.js';
import { teamRoles } from '../../../../../team/domain/types/team.types.js';
import { UserRepositoryInterface } from '../../../../../user/domain/ports/user.interface.js';
import { UserRepository } from '../../../../../user/infrastructure/persistence/user.repository.js';
import { v7 } from 'uuid';

describe('get-board-by-team-handler integration', () => {
  let handler: GetBoardsByTeamHandler;
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
        GetBoardsByTeamHandler,
        BoardRepository,
        { provide: DB_PROVIDER, useValue: db },
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
