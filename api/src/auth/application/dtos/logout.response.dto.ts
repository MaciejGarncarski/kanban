import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LogoutResponseDto {
  @ApiProperty({
    example: 'Logged out',
    description: 'Logout confirmation message',
  })
  @IsString({ message: 'Message must be a string' })
  message: string;
}
