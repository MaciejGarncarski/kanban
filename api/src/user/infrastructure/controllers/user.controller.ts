import { Controller, Get } from '@nestjs/common';
import { UserService } from 'src/user/user.service';

@Controller('user')
export class UserController {
  constructor(private readonly appService: UserService) {}

  @Get()
  async getUsers() {
    return this.appService.getLastUsers();
  }
}
