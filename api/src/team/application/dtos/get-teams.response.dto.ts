import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsArray, IsString, ValidateNested } from 'class-validator';

export class TeamDto {
  @ApiProperty({ example: '019a2a86-2c15-77a7-84a2-55e02cdf0d5f' })
  @IsString()
  @Expose()
  id: string;

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
  created_at: string;
}

export class GetTeamsResponseDto {
  @ApiProperty({ type: [TeamDto], description: 'List of teams for the user' })
  @IsArray()
  @ValidateNested({ each: true })
  @Expose()
  teams: TeamDto[];
}
