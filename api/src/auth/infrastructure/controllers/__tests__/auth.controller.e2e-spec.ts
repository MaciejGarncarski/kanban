import { Test, TestingModule } from '@nestjs/testing';
import { getTestDb, stopTestDb } from 'src/__tests__/utils/get-test-db';
import { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { Pool } from 'pg';
import { AuthModule } from 'src/auth/auth.module';
import { DB } from 'src/db/client';
import { DbModule } from 'src/db/db.module';
import { createJWTService } from 'src/__tests__/utils/create-jwt-service';
import { TestConfigModule } from 'src/__tests__/utils/get-test-env';
import { DB_PROVIDER } from 'src/db/db.provider';
import request from 'supertest';
import { routesV1 } from 'src/shared/configs/app.routes';
import { INestApplication } from '@nestjs/common';
import { Server } from 'node:net';
import cookieParser from 'cookie-parser';
import { testEnv } from 'src/__tests__/env';

describe('AuthController e2e', () => {
  let container: StartedPostgreSqlContainer;
  let pool: Pool;
  let app: INestApplication<Server>;
  let db: DB;

  beforeAll(async () => {
    const { pgContainer, pgPool, testDb } = await getTestDb();
    container = pgContainer;
    pool = pgPool;
    db = testDb;
  });

  afterAll(async () => {
    await stopTestDb(container, pool);
  });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TestConfigModule, AuthModule, DbModule],
      providers: [createJWTService(), { provide: DB_PROVIDER, useValue: db }],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser(testEnv.COOKIE_SECRET));

    await app.init();
  });

  describe('/auth/me', () => {
    it('should return 401 on unauthenticated', async () => {
      await request(app.getHttpServer()).get(routesV1.auth.me).expect(401);
    });
    it('should return 200 on authenticated', async () => {
      // this is e2e test, we cant mock.

      await request(app.getHttpServer())
        .post(routesV1.auth.signIn)
        .send({
          email: 'alice@example.com',
          password: 'Abcd123',
        })
        .expect(200);
    });
  });
});
