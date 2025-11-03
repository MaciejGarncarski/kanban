import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { type Response, type Request } from 'express';
import { CorrelationContext } from 'src/core/application/context/correlation.context';
import { v7 } from 'uuid';
import {
  ApiErrorResponse,
  ValidationError,
} from 'src/core/application/dtos/api-error.response.dto';
import { DrizzleQueryError } from 'drizzle-orm';

@Catch()
export class GlobalHttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalHttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const correlationId = CorrelationContext.getCorrelationId() ?? v7();

    let status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message: string = 'Unknown error';
    let validationErrors: ValidationError[] = [];
    let subErrors: string[] = [];
    let stack: string | undefined;

    if (exception instanceof HttpException) {
      const res = exception.getResponse() as ApiErrorResponse;

      if (typeof res === 'object') {
        message = res.message || exception.message;
        validationErrors = res.validationErrors || [];
        subErrors = res.subErrors || [];
      } else {
        message = res;
      }
    }

    if (exception instanceof DrizzleQueryError) {
      stack = exception.stack;
      subErrors.push(exception.message);
      exception.params.forEach((param: string) => subErrors.push(param));

      let drizzleStatus = HttpStatus.INTERNAL_SERVER_ERROR;
      let drizzleMessage = 'Database query failed';

      const msg = exception.message.toLowerCase();

      if (
        msg.includes('constraint') ||
        msg.includes('foreign key') ||
        msg.includes('not null') ||
        msg.includes('unique') ||
        msg.includes('invalid input') ||
        msg.includes('syntax error at or near')
      ) {
        drizzleStatus = HttpStatus.BAD_REQUEST;
        drizzleMessage = 'Invalid data or constraint violation';
      }

      message = drizzleMessage;

      if (status === 500) {
        (status as number) = drizzleStatus;
      }

      if (process.env.NODE_ENV !== 'production') {
        console.error('DrizzleQueryError:', exception);
      }
    }

    if (status >= 400 && status < 500) {
      this.logger.warn(
        `[${correlationId}] [Client ${request.path}] [User: ${request.userId ? request.userId : 'Not authenticated'}] error (${status}): ${message}`,
      );
    } else if (exception instanceof Error) {
      stack = exception.stack;
      this.logger.error(
        `[${correlationId}] [Server ${request.path}] [User: ${request.userId ? request.userId : 'Not authenticated'}] error (${status}): ${message}`,
        stack,
      );
    }

    const errorName =
      exception instanceof HttpException
        ? exception.name
        : 'InternalServerError';

    const errorResponse = new ApiErrorResponse({
      statusCode: status,
      message,
      validationErrors:
        validationErrors.length > 0 ? validationErrors : undefined,
      subErrors: subErrors.length > 0 ? subErrors : undefined,
      error: errorName,
      correlationId,
    });

    response.status(status).json(errorResponse);
  }
}
