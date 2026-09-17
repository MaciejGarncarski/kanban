import { faker } from '@faker-js/faker';
import { CqrsModule } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { hash } from '@node-rs/argon2';
import { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { Pool } from 'pg';
import { createJWTService } from '../../../../../__tests__/utils/create-jwt-service.js';
import {
  getTestDb,
  stopTestDb,
} from '../../../../../__tests__/utils/get-test-db.js';
import { TestConfigModule } from '../../../../../__tests__/utils/get-test-env.js';
import { DB } from '../../../../../infrastructure/persistence/db/client.js';
import { DB_PROVIDER } from '../../../../../infrastructure/persistence/db/db.provider.js';
import { generateReadableId } from '../../../../../infrastructure/persistence/generate-readable-id.js';
import { ProfanityCheckService } from '../../../../../infrastructure/services/profanity-check.service.js';
import { UpdateTeamHandler } from '../update-team.handler.js';
import { UpdateTeamCommand } from '../../update-team.command.js';
import { TeamRepository } from '../../../../infrastructure/persistence/team.repository.js';
import { UserRepositoryInterface } from '../../../../../user/domain/ports/user.interface.js';
import { UserRepository } from '../../../../../user/infrastructure/persistence/user.repository.js';

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
