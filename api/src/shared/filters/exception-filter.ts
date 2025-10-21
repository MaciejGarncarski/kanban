import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { type Response, type Request } from 'express';
import { CorrelationContext } from 'src/shared/context/correlation-context';
import { randomUUID } from 'crypto';
import { ApiErrorResponse } from 'src/shared/dtos/api-error.response';
import { DrizzleQueryError } from 'drizzle-orm';

@Catch()
export class GlobalHttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalHttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const correlationId = CorrelationContext.getCorrelationId() ?? randomUUID();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message: string = 'Unknown error';
    let validationErrors: Record<string, unknown>[] = [];
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
      message = 'Drizzle Query Error';
    } else if (exception instanceof Error) {
      stack = exception.stack;
    }

    if (status >= 400 && status < 500) {
      this.logger.warn(
        `[${correlationId}] [Client ${request.path}] [User: ${request.userId ? request.userId : 'Not authenticated'}] error (${status}): ${message}`,
      );
    } else {
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
