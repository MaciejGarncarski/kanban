import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsISO8601, IsNotEmpty, IsString } from 'class-validator';
export class UserResponseDto {
  @ApiProperty({
    example: '0199f343-b727-7971-a165-2c495b512976',
    description: 'User ID',
  })
  @IsString({ message: 'User ID must be a string' })
  @Expose()
  id: string;

  @ApiProperty({
    example: 'Alice',
    description: 'User name',
  })
  @IsString({ message: 'User name must be a string' })
  @Expose()
  name: string;

  @ApiProperty({
    example: 'alice@example.com',
    description: 'User email address',
  })
  @IsString({ message: 'User email must be a string' })
  @Expose()
  email: string;

  @ApiProperty({
    example: '2025-10-17T15:42:05.351Z',
    description: 'User account creation date',
  })
  @IsISO8601({ strict: true })
  @IsNotEmpty()
  @Type(() => Date)
  @Expose()
  createdAt: Date;
}
