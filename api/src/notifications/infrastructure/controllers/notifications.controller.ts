import { Controller, Sse, MessageEvent, Req } from '@nestjs/common';
import { type Request } from 'express';
import { Observable, Subject } from 'rxjs';
import { Auth } from '../../../auth/common/decorators/auth.decorator.js';
import { routesV1 } from '../../../infrastructure/configs/app.routes.config.js';
import { NotificationsService } from '../services/notifications.service.js';

@Controller()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Sse(routesV1.notifications.stream)
  @Auth()
  stream(@Req() req: Request): Observable<MessageEvent> {
    const clientId = req.userId;
    const subject = new Subject<MessageEvent>();

    this.notificationsService.addClient(clientId, subject);

    return new Observable<MessageEvent>((observer) => {
      const subscription = subject.subscribe(observer);
      return () => {
        subscription.unsubscribe();
        this.notificationsService.removeClient(clientId);
      };
    });
  }
}
