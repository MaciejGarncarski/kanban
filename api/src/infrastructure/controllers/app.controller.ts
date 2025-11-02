import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { routesV1 } from 'src/infrastructure/configs/app.routes.config';

@Controller()
export class AppController {
  @Get(routesV1.healthcheck.root)
  @ApiOperation({
    summary: 'App health check',
  })
  @ApiOkResponse({
    description: 'App is healthy',
  })
  async healthCheck() {
    return { status: 'ok' };
  }
}
