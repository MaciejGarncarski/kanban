import { NextFunction, Request, Response } from 'express';
import { CorrelationIdMiddleware } from '../correlation-id.middleware.js';
import { type Mock, vi } from 'vitest';

describe('CorrelationIdMiddleware', () => {
  let middleware: CorrelationIdMiddleware;

  beforeEach(() => {
    middleware = new CorrelationIdMiddleware();
  });

  it('should set correlation ID from headers if present', async () => {
    const req: Partial<Request> = {
      headers: {
        'x-correlation-id': 'test-correlation-id',
      },
    };
    const res: Partial<Response> = {
      set: vi.fn(),
    };

    await new Promise<void>((resolve) => {
      const next: NextFunction = () => {
        expect(res.set).toHaveBeenCalledWith(
          'X-Correlation-ID',
          'test-correlation-id',
        );
        resolve();
      };

      middleware.use(req as Request, res as Response, next);
    });
  });

  it('should generate a new correlation ID if not present in headers', async () => {
    const req: Partial<Request> = {
      headers: {},
    };
    const res: Partial<Response> = {
      set: vi.fn(),
    };

    await new Promise<void>((resolve) => {
      const next: NextFunction = () => {
        expect(res.set).toHaveBeenCalledWith(
          'X-Correlation-ID',
          expect.any(String),
        );

        const correlationId = (res.set as Mock).mock.calls[0] as [
          string,
          string,
        ];

        expect(correlationId[1]).toHaveLength(36); // UUID length
        resolve();
      };

      middleware.use(req as Request, res as Response, next);
    });
  });
});
