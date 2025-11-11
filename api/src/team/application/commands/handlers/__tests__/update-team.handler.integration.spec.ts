import { faker } from '@faker-js/faker';
import { CqrsModule } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { hash } from '@node-rs/argon2';
import { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { _ } from 'node_modules/@faker-js/faker/dist/airline-CLphikKp.cjs';
import { Pool } from 'pg';
import { createJWTService } from 'src/__tests__/utils/create-jwt-service';
import { getTestDb, stopTestDb } from 'src/__tests__/utils/get-test-db';
import { TestConfigModule } from 'src/__tests__/utils/get-test-env';
import { DB } from 'src/infrastructure/persistence/db/client';
import { DB_PROVIDER } from 'src/infrastructure/persistence/db/db.provider';
import { generateReadableId } from 'src/infrastructure/persistence/generate-readable-id';
import { ProfanityCheckService } from 'src/infrastructure/services/profanity-check.service';
import { UpdateTeamHandler } from 'src/team/application/commands/handlers/update-team.handler';
import { UpdateTeamCommand } from 'src/team/application/commands/update-team.command';
import { TeamRepository } from 'src/team/infrastructure/persistence/team.repository';
import { UserRepositoryInterface } from 'src/user/domain/ports/user.interface';
import { UserRepository } from 'src/user/infrastructure/persistence/user.repository';

describe('UpdateTeamHandler Integration Tests', () => {
  let handler: UpdateTeamHandler;
  let userRepo: UserRepositoryInterface;
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
      imports: [TestConfigModule, CqrsModule],
      providers: [
        UpdateTeamHandler,
        ProfanityCheckService,
        { provide: TeamRepository, useValue: teamRepo },
        { provide: DB_PROVIDER, useValue: db },
        { provide: UserRepository, useValue: userRepo },
        createJWTService(),
      ],
    }).compile();

    await module.init();

    handler = module.get<UpdateTeamHandler>(UpdateTeamHandler);
    userRepo = module.get<UserRepositoryInterface>(UserRepository);
  });

  it('should update a team', async () => {
    // Arrange
    const user = await userRepo.create({
      email: faker.internet.email(),
      password_hash: await hash(faker.internet.password()),
      name: faker.person.fullName(),
    });

    const team = await teamRepo.createTeam(
      user.id,
      {
        name: 'Test Team',
        description: 'A team for testing',
        readable_id: generateReadableId(),
      },
      [],
    );

    // Act
    await handler.execute(
      new UpdateTeamCommand(
        team.readableId,
        user.id,
        'changed name',
        'changed description',
      ),
    );
    const updatedTeam = await teamRepo.findById(team.readableId);

    // Assert

    expect(updatedTeam).toBeDefined();
    expect(updatedTeam?.name).toBe('changed name');
    expect(updatedTeam?.description).toBe('changed description');
  });

  it('should throw BadRequestException for profane team name', async () => {
    // Arrange
    const user = await userRepo.create({
      email: faker.internet.email(),
      password_hash: await hash(faker.internet.password()),
      name: faker.person.fullName(),
    });

    const team = await teamRepo.createTeam(
      user.id,
      {
        name: 'Test Team',
        description: 'A team for testing',
        readable_id: generateReadableId(),
      },
      [],
    );

    // Act & Assert
    await expect(
      handler.execute(
        new UpdateTeamCommand(
          team.readableId,
          user.id,
          'fuck',
          'changed description',
        ),
      ),
    ).rejects.toThrow('Team name contains inappropriate language.');
  });

  it('should throw BadRequestException for profane team description', async () => {
    // Arrange
    const user = await userRepo.create({
      email: faker.internet.email(),
      password_hash: await hash(faker.internet.password()),
      name: faker.person.fullName(),
    });

    const team = await teamRepo.createTeam(
      user.id,
      {
        name: 'Test Team',
        description: 'A team for testing',
        readable_id: generateReadableId(),
      },
      [],
    );

    // Act & Assert
    await expect(
      handler.execute(
        new UpdateTeamCommand(team.readableId, user.id, 'ok', 'fuck'),
      ),
    ).rejects.toThrow('Team description contains inappropriate language.');
  });
});
