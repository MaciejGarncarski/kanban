import { UserRepository } from 'src/user/infrastructure/persistence/user.repository';
import { drizzle } from 'drizzle-orm/node-postgres';
import { DB } from 'src/db/client';
import { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { getTestDb, stopTestDb } from 'src/__tests__/utils/get-test-db';
import { Pool } from 'pg';
import { faker } from '@faker-js/faker';
import { UserRepositoryInterface } from 'src/user/domain/repository/user.interface';

jest.setTimeout(60_000);

describe('UserRepository', () => {
  let repo: UserRepositoryInterface;
  let db: DB;
  let container: StartedPostgreSqlContainer;
  let pool: Pool;

  beforeAll(async () => {
    const { pgContainer, pgPool } = await getTestDb();
    container = pgContainer;
    pool = pgPool;

    db = drizzle(pgPool);
    repo = new UserRepository(db);
  });

  afterAll(async () => {
    await stopTestDb(container, pool);
  });

  it('should return all users', async () => {
    const users = await repo.all();
    expect(Array.isArray(users)).toBe(true);
  });

  it('should create user', async () => {
    const fullName = faker.person.fullName();
    const email = faker.internet.email();
    const passwordHash = faker.internet.password();

    const user = await repo.create({
      name: fullName,
      email: email,
      password_hash: passwordHash,
    });

    expect(user).toHaveProperty('id');
    expect(user.name).toBe(fullName);
    expect(user.email).toBe(email.toLowerCase());
  });

  it('should create and find a user', async () => {
    const fullName = faker.person.fullName();
    const email = faker.internet.email();
    const passwordHash = faker.internet.password();

    const user = await repo.create({
      name: fullName,
      email: email,
      password_hash: passwordHash,
    });

    expect(user.email).toBe(email.toLowerCase());

    const found = await repo.find(user.id);
    expect(found.name).toBe(fullName);
    expect(found.email).toBe(email.toLowerCase());
  });

  it('should create and find user by email', async () => {
    const fullName = faker.person.fullName();
    const email = faker.internet.email();
    const passwordHash = faker.internet.password();

    const user = await repo.create({
      name: fullName,
      email: email,
      password_hash: passwordHash,
    });

    expect(user.email).toBe(email.toLowerCase());
    const found = await repo.findByEmail(user.email);
    expect(found.name).toBe(fullName);
    expect(found.email).toBe(email.toLowerCase());
  });
});
