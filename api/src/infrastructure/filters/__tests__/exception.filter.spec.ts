import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response, Request } from 'express';
import { ApiErrorResponse } from '../../../core/application/dtos/api-error.response.dto.js';
import { DrizzleQueryError } from 'drizzle-orm';
import { GlobalHttpExceptionFilter } from '../exception.filter.js';
import { vi } from 'vitest';

describe('GlobalHttpExceptionFilter', () => {
  let filter: GlobalHttpExceptionFilter;
  let mockResponse: Partial<Response>;
  let mockRequest: Partial<Request>;
  let mockHost: Partial<ArgumentsHost>;

  beforeEach(() => {
    filter = new GlobalHttpExceptionFilter();

    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    mockRequest = {
      path: '/test',
      userId: '123',
    };

    mockHost = {
      switchToHttp: vi.fn().mockReturnValue({
        getRequest: () => mockRequest,
        getResponse: () => mockResponse,
      }),
    };
  });

  it('should handle generic Error and return 500', () => {
    const exception = new Error('Test exception');

    filter.catch(exception, mockHost as ArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Unknown error',
        error: 'InternalServerError',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        correlationId: expect.any(String),
      }),
    );
  });

  it('should handle HttpException and return proper status', () => {
    const exception = new HttpException('Bad Request', HttpStatus.BAD_REQUEST);

    filter.catch(exception, mockHost as ArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Bad Request',
        error: 'HttpException',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        correlationId: expect.any(String),
      }),
    );
  });

  it('should handle HttpException with ApiErrorResponse payload', () => {
    const apiError = new ApiErrorResponse({
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      message: 'Validation failed',
      validationErrors: [{ field: 'email', message: 'Invalid email' }],
      correlationId: 'test-correlation-id',
      error: 'HttpException',
    });

    const exception = new HttpException(
      apiError,
      HttpStatus.UNPROCESSABLE_ENTITY,
    );

    filter.catch(exception, mockHost as ArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Validation failed',
        validationErrors: [{ field: 'email', message: 'Invalid email' }],
      }),
    );
  });

  it('should handle HttpException with string message', () => {
    const exception = new HttpException('Not Found', HttpStatus.NOT_FOUND);

    filter.catch(exception, mockHost as ArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Not Found',
        error: 'HttpException',
      }),
    );
  });

  it('should handle DrizzleQueryError specifically', () => {
    const drizzleError = new DrizzleQueryError('Query failed', [null]);

    filter.catch(drizzleError, mockHost as ArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Database query failed',
        error: 'InternalServerError',
      }),
    );
  });

  it('should handle DrizzleQueryError with constraint violation', () => {
    const drizzleError = new DrizzleQueryError('Unique constraint violated', [
      null,
    ]);

    filter.catch(drizzleError, mockHost as ArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Invalid data or constraint violation',
        error: 'InternalServerError',
      }),
    );
  });
});
