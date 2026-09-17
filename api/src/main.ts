import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import {
  BadRequestException,
  StandardSchemaValidationPipe,
} from '@nestjs/common';
import type { StandardSchemaV1 } from '@standard-schema/spec';
import cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { getEnvConfig } from './infrastructure/configs/env.config.js';
import { GlobalHttpExceptionFilter } from './infrastructure/filters/exception.filter.js';
import { TeamRole } from './team/domain/types/team.types.js';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
  });
  const configService = app.get(ConfigService);
  const env = getEnvConfig(configService);

  if (!env) {
    throw new Error('Environment configuration is missing');
  }

  app.set('trust proxy', 'loopback');
  app.use(cookieParser(env.COOKIE_SECRET));
  app.enableCors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Kanban app')
    .setDescription('The cats API description')
    .setVersion('1.0')
    .addCookieAuth('accessToken', {
      type: 'apiKey',
      name: 'accessToken',
      in: 'cookie',
    })
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'access-token',
      description: 'Enter JWT access token',
      in: 'header',
    })
    .addTag('kanban')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  app.useGlobalPipes(
    new StandardSchemaValidationPipe({
      exceptionFactory: (issues: readonly StandardSchemaV1.Issue[]) => {
        if (process.env.NODE_ENV === 'development') {
          console.error('Validation errors:', issues);
        }

        const messagesByField = new Map<string, string[]>();
        for (const issue of issues) {
          // `unrecognized_keys` issues carry an empty path; Zod exposes the
          // offending keys so the shape stays close to the previous
          // forbidNonWhitelisted errors.
          const keys = (issue as { keys?: unknown }).keys;
          const field =
            Array.isArray(keys) && keys.length > 0
              ? keys.map(String).join(', ')
              : (issue.path ?? []).map(String).join('.') || 'unknown';
          messagesByField.set(field, [
            ...(messagesByField.get(field) ?? []),
            issue.message,
          ]);
        }

        const validationErrors = [...messagesByField].map(
          ([field, messages]) => ({ field, messages }),
        );

        return new BadRequestException({
          statusCode: 400,
          message: 'Validation failed',
          validationErrors,
        });
      },
    }),
  );
  app.useGlobalFilters(new GlobalHttpExceptionFilter());

  await app.listen(env.API_PORT ?? 3000);

  console.log(
    `Application is running on: http://localhost:${env.API_PORT ?? 3000}`,
  );
  console.log(
    `Swagger is running on: http://localhost:${env.API_PORT ?? 3000}/api`,
  );
  console.log(`CORS allowed origin: ${env.CORS_ORIGIN}`);
  console.log('-------------------------------------------------');
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();

declare module 'express' {
  export interface Request {
    userId: string;
    userRole?: TeamRole;
  }
}
