import { Test, TestingModule } from '@nestjs/testing';
import { getTestDb, stopTestDb } from 'src/__tests__/utils/get-test-db';
import { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { Pool } from 'pg';
import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Server } from 'node:net';
import cookieParser from 'cookie-parser';
import { testEnv } from 'src/__tests__/env';
import { getCookieFromResponse } from 'src/__tests__/utils/get-cookie-from-response';
import { userFixture } from 'src/__tests__/fixtures/user.fixture';
import { routesV1 } from 'src/infrastructure/configs/app.routes.config';
import { AppModule } from 'src/app.module';

describe('AuthController e2e', () => {
  let container: StartedPostgreSqlContainer;
  let pool: Pool;
  let app: INestApplication<Server>;

  beforeAll(async () => {
    const { pgContainer, pgPool } = await getTestDb();
    container = pgContainer;
    pool = pgPool;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser(testEnv.COOKIE_SECRET));

    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await stopTestDb(container, pool);
  });

  describe('/auth/me', () => {
    it('should return 401 on unauthenticated', async () => {
      await request(app.getHttpServer()).get(routesV1.auth.me).expect(401);
    });
    it('should return 200 on authenticated', async () => {
      const signInResponse = await request(app.getHttpServer())
        .post(routesV1.auth.signIn)
        .send(userFixture)
        .expect(200);

      const response = await request(app.getHttpServer())
        .get(routesV1.auth.me)
        .set('Cookie', signInResponse.headers['set-cookie'])
        .send()
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('email', userFixture.email);
    });
  });

  describe('/auth/refresh-token', () => {
    it('should return 401 on unauthenticated', async () => {
      await request(app.getHttpServer())
        .post(routesV1.auth.refresh)
        .expect(401);
    });
    it('should return 200 and new tokens on authenticated', async () => {
      const signInResponse = await request(app.getHttpServer())
        .post(routesV1.auth.signIn)
        .send(userFixture)
        .expect(200);

      const response = await request(app.getHttpServer())
        .post(routesV1.auth.refresh)
        .set('Cookie', signInResponse.headers['set-cookie'])
        .send()
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');

      const oldRefreshTokenCookie = getCookieFromResponse(
        signInResponse,
        'refreshToken',
      );
      const newRefreshTokenCookie = getCookieFromResponse(
        response,
        'refreshToken',
      );

      expect(oldRefreshTokenCookie).toBeDefined();
      expect(newRefreshTokenCookie).toBeDefined();
      expect(oldRefreshTokenCookie).not.toEqual(newRefreshTokenCookie);
    });
  });

  describe('/auth/logout', () => {
    it('should return 200 on authenticated and clear cookies', async () => {
      const signInResponse = await request(app.getHttpServer())
        .post(routesV1.auth.signIn)
        .send(userFixture)
        .expect(200);

      const response = await request(app.getHttpServer())
        .delete(routesV1.auth.logout)
        .set('Cookie', signInResponse.headers['set-cookie'])
        .send()
        .expect(200);

      const refreshTokenCookie = getCookieFromResponse(
        response,
        'refreshToken',
      );

      expect(refreshTokenCookie).toBeDefined();
      expect(refreshTokenCookie).toMatch(
        /Expires=Thu, 01 Jan 1970 00:00:00 GMT/,
      );
    });
  });
});
