import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response, Request } from 'express';
import { ApiErrorResponse } from 'src/core/application/dtos/api-error.response.dto';
import { DrizzleQueryError } from 'drizzle-orm';
import { GlobalHttpExceptionFilter } from 'src/infrastructure/filters/exception.filter';

describe('GlobalHttpExceptionFilter', () => {
  let filter: GlobalHttpExceptionFilter;
  let mockResponse: Partial<Response>;
  let mockRequest: Partial<Request>;
  let mockHost: Partial<ArgumentsHost>;

  beforeEach(() => {
    filter = new GlobalHttpExceptionFilter();

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    mockRequest = {
      path: '/test',
      userId: '123',
    };

    mockHost = {
      switchToHttp: jest.fn().mockReturnValue({
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
});
