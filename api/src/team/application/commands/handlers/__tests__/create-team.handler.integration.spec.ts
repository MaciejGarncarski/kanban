import { faker } from '@faker-js/faker';
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
import { ProfanityCheckService } from '../../../../../infrastructure/services/profanity-check.service.js';
import { CreateTeamCommand } from '../../create-team.command.js';
import { CreateTeamHandler } from '../create-team.handler.js';
import { TeamRepository } from '../../../../infrastructure/persistence/team.repository.js';
import { UserRepositoryInterface } from '../../../../../user/domain/ports/user.interface.js';
import { UserRepository } from '../../../../../user/infrastructure/persistence/user.repository.js';

describe('CreateTeamHandler Integration Tests', () => {
  let handler: CreateTeamHandler;
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
      imports: [TestConfigModule],
      providers: [
        ProfanityCheckService,
        CreateTeamHandler,
        { provide: TeamRepository, useValue: teamRepo },
        { provide: DB_PROVIDER, useValue: db },
        { provide: UserRepository, useValue: userRepo },
        createJWTService(),
      ],
    }).compile();

    handler = module.get<CreateTeamHandler>(CreateTeamHandler);
    userRepo = module.get<UserRepositoryInterface>(UserRepository);
  });

  it('should create a new team', async () => {
    // Arrange
    const user = await userRepo.create({
      email: faker.internet.email(),
      password_hash: await hash(faker.internet.password()),
      name: faker.person.fullName(),
    });

    const createTeamDto = {
      name: 'Test Team',
      description: 'A team for testing',
      members: [user.id],
    };

    // Act
    const result = await handler.execute(
      new CreateTeamCommand(
        user.id,
        createTeamDto.name,
        createTeamDto.description,
        createTeamDto.members,
      ),
    );

    // Assert
    expect(result).toHaveProperty('readableId');
    expect(result.name).toBe(createTeamDto.name);
    expect(result.description).toBe(createTeamDto.description);
  });

  it('should throw BadRequestException for profane team name', async () => {
    // Arrange
    const user = await userRepo.create({
      email: faker.internet.email(),
      password_hash: await hash(faker.internet.password()),
      name: faker.person.fullName(),
    });

    const createTeamDto = {
      name: 'fuck', // Assume this is a profane word
      description: 'A team with a bad name',
      members: [user.id],
    };

    // Act & Assert
    await expect(
      handler.execute(
        new CreateTeamCommand(
          user.id,
          createTeamDto.name,
          createTeamDto.description,
          createTeamDto.members,
        ),
      ),
    ).rejects.toThrow('Team name contains profane content');
  });

  it('should throw BadRequestException for profane team description', async () => {
    // Arrange
    const user = await userRepo.create({
      email: faker.internet.email(),
      password_hash: await hash(faker.internet.password()),
      name: faker.person.fullName(),
    });

    const createTeamDto = {
      name: 'Clean Name',
      description: 'fuck', // Assume this is a profane word
      members: [user.id],
    };

    // Act & Assert
    await expect(
      handler.execute(
        new CreateTeamCommand(
          user.id,
          createTeamDto.name,
          createTeamDto.description,
          createTeamDto.members,
        ),
      ),
    ).rejects.toThrow('Team description contains profane content');
  });
});
