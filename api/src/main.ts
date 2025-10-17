import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { GlobalHttpExceptionFilter } from 'src/shared/filters/exception-filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {});

  const config = new DocumentBuilder()
    .setTitle('Kanban app')
    .setDescription('The cats API description')
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'Authorization',
      description: 'Enter JWT access token',
      in: 'header',
    })
    .addTag('kanban')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  app.use(cookieParser(process.env.COOKIE_SECRET));
  app.enableCors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => {
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

  app.useGlobalFilters(new GlobalHttpExceptionFilter());

  await app.listen(process.env.PORT ?? 3000);

  console.log(
    `Application is running on: http://localhost:${process.env.PORT ?? 3000}`,
  );

  console.log(
    `Swagger is running on: http://localhost:${process.env.PORT ?? 3000}/api`,
  );

  console.log(`CORS allowed origin: ${process.env.CORS_ORIGIN}`);

  console.log('-------------------------------------------------');
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();

declare module 'express' {
  export interface Request {
    userId: string;
  }
}
