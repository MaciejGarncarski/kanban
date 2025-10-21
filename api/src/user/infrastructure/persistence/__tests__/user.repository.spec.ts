import { UserRepositoryPort } from 'src/user/application/ports/user.repository.port';
import { UserRepository } from 'src/user/infrastructure/persistence/user.repository';
import { drizzle } from 'drizzle-orm/node-postgres';
import { DB } from 'src/db/client';
import { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { getTestDb, stopTestDb } from 'src/__tests__/utils/get-test-db';
import { Pool } from 'pg';
import { faker } from '@faker-js/faker';

jest.setTimeout(60_000);

describe('UserRepository', () => {
  let repo: UserRepositoryPort;
  let db: DB;
  let container: StartedPostgreSqlContainer;
  let pool: Pool;

  beforeAll(async () => {
    console.log('Starting Postgres container...');

    const { pgContainer, pgPool } = await getTestDb();
    container = pgContainer;
    pool = pgPool;

    db = drizzle(pgPool);
    repo = new UserRepository(db);
  });

  afterAll(async () => {
    console.log('Stopping Postgres container...');
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
    expect(user.email).toBe(email);
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

    expect(user.email).toBe(email);

    const found = await repo.find(user.id);
    expect(found.name).toBe(fullName);
    expect(found.email).toBe(email);
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

    expect(user.email).toBe(email);
    const found = await repo.findByEmail(user.email);
    expect(found.name).toBe(fullName);
    expect(found.email).toBe(email);
  });
});
