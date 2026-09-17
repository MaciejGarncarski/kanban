import { faker } from '@faker-js/faker';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { Pool } from 'pg';
import { createJWTService } from '../../../../../__tests__/utils/create-jwt-service.js';
import {
  getTestDb,
  stopTestDb,
} from '../../../../../__tests__/utils/get-test-db.js';
import { TestConfigModule } from '../../../../../__tests__/utils/get-test-env.js';
import { RegisterUserHandler } from '../register.handler.js';
import { RegisterCommand } from '../../register.command.js';
import { JWTPayload } from '../../../../domain/token.types.js';
import { RefreshTokenRepository } from '../../../../infrastructure/persistence/refresh-token.repository.js';
import { type DB } from '../../../../../infrastructure/persistence/db/client.js';
import { DB_PROVIDER } from '../../../../../infrastructure/persistence/db/db.provider.js';
import { ProfanityCheckService } from '../../../../../infrastructure/services/profanity-check.service.js';
import { UserRepositoryInterface } from '../../../../../user/domain/ports/user.interface.js';
import { UserRepository } from '../../../../../user/infrastructure/persistence/user.repository.js';

describe('register-user-handler integration', () => {
  let handler: RegisterUserHandler;
  let userRepo: UserRepositoryInterface;
  let refreshTokenRepo: RefreshTokenRepository;
  let container: StartedPostgreSqlContainer;
  let pool: Pool;
  let db: DB;
  let jwtService: JwtService;

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
        ProfanityCheckService,
        RegisterUserHandler,
        RefreshTokenRepository,
        { provide: DB_PROVIDER, useValue: db },
        { provide: RefreshTokenRepository, useValue: refreshTokenRepo },
        { provide: UserRepository, useValue: userRepo },
        createJWTService(),
      ],
    }).compile();

    handler = module.get<RegisterUserHandler>(RegisterUserHandler);
    userRepo = module.get<UserRepositoryInterface>(UserRepository);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should register a new user and return tokens', async () => {
    const email = faker.internet.email();
    const password = faker.internet.password();

    const command = new RegisterCommand(
      email,
      faker.person.fullName(),
      password,
      password,
    );

    const result = await handler.execute(command);

    const createdUser = await userRepo.findByEmail(email);
    expect(createdUser).toBeDefined();
    expect(createdUser?.email).toBe(email.toLowerCase());
    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();

    const decodedAccessToken = jwtService.decode<JWTPayload>(
      result.accessToken,
    );

    expect(decodedAccessToken).toBeDefined();
    expect(decodedAccessToken?.sub).toBe(createdUser?.id);
  });

  it('should throw error if passwords do not match', async () => {
    const command = new RegisterCommand(
      faker.internet.email(),
      faker.person.fullName(),
      'password1',
      'password2',
    );

    await expect(handler.execute(command)).rejects.toThrow(
      'Passwords do not match',
    );
  });

  it('should throw error if email is already in use', async () => {
    const email = faker.internet.email();
    const password = faker.internet.password();
    const command1 = new RegisterCommand(
      email,
      faker.person.fullName(),
      password,
      password,
    );

    await handler.execute(command1);

    const command2 = new RegisterCommand(
      email,
      faker.person.fullName(),
      password,
      password,
    );

    await expect(handler.execute(command2)).rejects.toThrow(
      'Email already in use',
    );
  });

  it('should throw error if name contains profanity', async () => {
    const email = faker.internet.email();
    const password = faker.internet.password();
    const command = new RegisterCommand(email, 'fuck', password, password);

    await expect(handler.execute(command)).rejects.toThrow(
      'Name contains inappropriate language',
    );
  });
});
