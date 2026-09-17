import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from '../../../user/application/dtos/user.response.dto.js';

export class RegisterResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT access token',
  })
  accessToken: string;

  @ApiProperty({
    type: () => UserResponseDto,
    description: 'Registered user information',
  })
  user: UserResponseDto;
}
