import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { CorrelationContext } from 'src/core/application/context/correlation.context';
import { v7 } from 'uuid';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const correlationId = req.headers['x-correlation-id']?.toString() || v7();

    res.set('X-Correlation-ID', correlationId);

    CorrelationContext.run(correlationId, () => {
      next();
    });
  }
}
