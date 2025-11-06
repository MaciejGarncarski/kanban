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
import { team_members } from 'src/infrastructure/persistence/db/schema';
import { generateReadableId } from 'src/infrastructure/persistence/generate-readable-id';
import { GetTeamsHandler } from 'src/team/application/queries/handlers/get-teams.handler';
import { TeamRepository } from 'src/team/infrastructure/persistence/team.repository';
import { UserRepository } from 'src/user/infrastructure/persistence/user.repository';

describe('GetTeamsHandler', () => {
  let handler: GetTeamsHandler;
  let userRepo: UserRepository;
  let teamRepo: TeamRepository;
  let container: StartedPostgreSqlContainer;
  let pool: Pool;
  let db: DB;

  beforeAll(async () => {
    const { pgContainer, pgPool, testDb } = await getTestDb();
    container = pgContainer;
    pool = pgPool;

    db = testDb;
    userRepo = new UserRepository(testDb);
    teamRepo = new TeamRepository(testDb);
  });

  afterAll(async () => {
    await stopTestDb(container, pool);
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TestConfigModule],
      providers: [
        GetTeamsHandler,
        { provide: TeamRepository, useValue: teamRepo },
        { provide: DB_PROVIDER, useValue: db },
        { provide: UserRepository, useValue: userRepo },
        createJWTService(),
      ],
    }).compile();

    handler = module.get<GetTeamsHandler>(GetTeamsHandler);
    userRepo = module.get<UserRepository>(UserRepository);
  });

  it('should retrieve teams for a user', async () => {
    // Arrange
    const user = await userRepo.create({
      email: faker.internet.email(),
      password_hash: await hash(faker.internet.password()),
      name: faker.person.fullName(),
    });

    const teamName1 = faker.company.name();
    const teamName2 = faker.company.name();

    const team1 = await teamRepo.createTeam(
      user.id,
      {
        name: teamName1,
        readable_id: generateReadableId(),
      },
      [user.id],
    );

    const team2 = await teamRepo.createTeam(
      user.id,
      {
        name: teamName2,
        readable_id: generateReadableId(),
      },
      [user.id],
    );

    await db.insert(team_members).values([
      {
        team_id: team1.id,
        user_id: user.id,
      },
      {
        team_id: team2.id,
        user_id: user.id,
      },
    ]);

    // Act
    const result = await handler.execute({ userId: user.id });

    // Assert
    expect(result.teams).toHaveLength(2);
    const teamNames = result.teams.map((team) => team.name);
    expect(teamNames).toContain(teamName1);
    expect(teamNames).toContain(teamName2);
  });
});
