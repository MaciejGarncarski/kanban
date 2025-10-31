import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import {
  BadRequestException,
  ClassSerializerInterceptor,
  ValidationPipe,
} from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { getEnvConfig } from 'src/infrastructure/configs/env.config';
import { GlobalHttpExceptionFilter } from 'src/infrastructure/filters/exception.filter';
import { TeamRole } from 'src/team/domain/types/team.types';

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
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        exposeUnsetFields: false,
      },
      exceptionFactory: (errors) => {
        if (process.env.NODE_ENV === 'development') {
          console.error('Validation errors:', errors);
        }

        const formattedErrors = errors.map((err) => ({
          field: err.property,
          messages: Object.values(err.constraints || {}),
        }));

        return new BadRequestException({
          statusCode: 400,
          message: 'Validation failed',
          validationErrors: formattedErrors,
        });
      },
    }),
  );
  const reflector = app.get(Reflector);
  app.useGlobalInterceptors(new ClassSerializerInterceptor(reflector));
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
