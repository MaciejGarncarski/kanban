import { ApiProperty } from '@nestjs/swagger';

export class LogoutResponseDto {
  @ApiProperty({
    example: 'Logged out',
    description: 'Logout confirmation message',
  })
  message: string;
}
