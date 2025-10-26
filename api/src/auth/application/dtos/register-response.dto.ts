import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { UserResponseDto } from 'src/user/application/dtos/user.response.dto';

export class RegisterResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT access token',
  })
  @IsString({ message: 'Access token must be a string' })
  accessToken: string;

  @ApiProperty({
    type: () => UserResponseDto,
    description: 'Registered user information',
  })
  @ValidateNested()
  @Type(() => UserResponseDto)
  user: UserResponseDto;
}
