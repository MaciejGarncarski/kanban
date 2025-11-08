import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsArray, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateTeamRequestDto {
  @ApiProperty({ description: 'Name of the team' })
  @IsString()
  @Expose()
  @MaxLength(32, { message: 'Name is too long' })
  name: string;

  @ApiProperty({ description: 'Description of the team', required: false })
  @IsOptional()
  @IsString()
  @Expose()
  @MaxLength(500, { message: 'Description is too long' })
  description?: string;

  @ApiProperty({ description: 'Array of member user IDs', required: false })
  @IsOptional()
  @Expose()
  @IsArray()
  members?: string[];
}
