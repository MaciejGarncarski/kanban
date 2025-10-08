import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { UsersResponseDto } from './app.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async getHello(): Promise<UsersResponseDto> {
    return {
      data: {
        users: [{ id: 1, name: await this.appService.getHello() }],
      },
      status: 'ok',
    };
  }
}
