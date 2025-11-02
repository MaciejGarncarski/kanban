import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { TeamDto } from 'src/team/application/dtos/team.dto';

export class GetTeamsResponseDto {
  @ApiProperty({ type: [TeamDto], description: 'List of teams for the user' })
  @IsArray()
  @ValidateNested({ each: true })
  @Expose()
  teams: TeamDto[];
}
