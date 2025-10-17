import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class SignInResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT access token',
  })
  @IsString({ message: 'Access token must be a string' })
  accessToken: string;
}
