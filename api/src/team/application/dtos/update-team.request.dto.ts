import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsArray, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateTeamRequestDto {
  @ApiProperty({ description: 'Name of the team' })
  @IsString()
  @Expose()
  @MaxLength(32)
  @IsOptional()
  name?: string;

  @ApiProperty({ description: 'Description of the team', required: false })
  @IsOptional()
  @IsString()
  @Expose()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ description: 'Array of member user IDs', required: false })
  @IsOptional()
  @Expose()
  @IsArray()
  members?: string[];
}

export class UpdateTeamParamsDto {
  @ApiProperty({ description: 'ID of the team' })
  @IsString()
  @Expose()
  teamId: string;
}
