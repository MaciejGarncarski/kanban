import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { CorrelationContext } from 'src/shared/context/correlation.context';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const correlationId =
      req.headers['x-correlation-id']?.toString() || randomUUID();

    res.set('X-Correlation-ID', correlationId);

    CorrelationContext.run(correlationId, () => {
      next();
    });
  }
}
