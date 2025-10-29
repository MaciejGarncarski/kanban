import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsISO8601, IsNotEmpty, IsString } from 'class-validator';

export class BoardDto {
  @ApiProperty({ example: '019a2a86-2c15-77a7-84a2-55e02cdf0d5f' })
  @IsString()
  @Expose()
  id: string;

  @ApiProperty({ example: 'Awesome board' })
  @IsString()
  @Expose()
  name: string;

  @ApiProperty({
    example: 'This is an awesome board.',
    required: false,
  })
  @IsString()
  @Expose()
  description: string;

  @ApiProperty({
    example: '7f3b2c1e-1c4d-4f5e-8b2f-1c4d5e8b2f1c',
    description: 'Team ID associated with the board',
  })
  @IsString()
  @Expose()
  teamId: string;

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
