import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class GetBoardsByTeamRequestDto {
  @ApiProperty({
    example: 'nanoid',
    description: 'Team ID',
  })
  @IsString()
  teamId: string;
}
