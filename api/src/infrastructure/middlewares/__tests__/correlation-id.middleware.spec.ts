import { NextFunction, Request, Response } from 'express';
import { CorrelationIdMiddleware } from 'src/infrastructure/middlewares/correlation-id.middleware';

describe('CorrelationIdMiddleware', () => {
  let middleware: CorrelationIdMiddleware;

  beforeEach(() => {
    middleware = new CorrelationIdMiddleware();
  });

  it('should set correlation ID from headers if present', (done) => {
    const req: Partial<Request> = {
      headers: {
        'x-correlation-id': 'test-correlation-id',
      },
    };
    const res: Partial<Response> = {
      set: jest.fn(),
    };
    const next: NextFunction = () => {
      expect(res.set).toHaveBeenCalledWith(
        'X-Correlation-ID',
        'test-correlation-id',
      );
      done();
    };

    middleware.use(req as Request, res as Response, next);
  });

  it('should generate a new correlation ID if not present in headers', (done) => {
    const req: Partial<Request> = {
      headers: {},
    };
    const res: Partial<Response> = {
      set: jest.fn(),
    };
    const next: NextFunction = () => {
      expect(res.set).toHaveBeenCalledWith(
        'X-Correlation-ID',
        expect.any(String),
      );

      const correlationId = (res.set as jest.Mock).mock.calls[0] as [
        string,
        string,
      ];

      expect(correlationId[1]).toHaveLength(36); // UUID length
      done();
    };

    middleware.use(req as Request, res as Response, next);
  });
});
