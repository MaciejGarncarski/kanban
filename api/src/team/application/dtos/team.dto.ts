import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsString } from 'class-validator';

export class TeamDto {
  @ApiProperty({ example: 'nanoid' })
  @IsString()
  @Expose()
  readableId: string;

  @ApiProperty({ example: 'Awesome Team' })
  @IsString()
  @Expose()
  name: string;

  @ApiProperty({
    example: 'This is an awesome team working on great projects.',
    required: false,
  })
  @IsString()
  @Expose()
  description: string;

  @ApiProperty({
    example: '2025-10-17T15:42:05.351Z',
    description: 'User account creation date',
  })
  @Expose()
  @Type(() => Date)
  createdAt: string;
}
