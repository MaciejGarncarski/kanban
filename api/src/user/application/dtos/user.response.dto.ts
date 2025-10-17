import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEmail } from 'class-validator';

export class UserResponseDto {
  @ApiProperty({
    example: 'joh-doe@gmail.com',
    description: "User's email address",
  })
  @IsEmail({}, { message: 'Invalid email address' })
  email: string;

  @ApiProperty({
    example: 'John Doe',
    description: "User's full name",
  })
  name: string;

  @ApiProperty({
    example: '2023-10-05T14:48:00.000Z',
    description: 'Timestamp when the user was created',
  })
  @IsDateString(
    {},
    { message: 'createdAt must be a valid ISO 8601 date string' },
  )
  createdAt: string;
}
