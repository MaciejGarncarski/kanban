import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class DeleteTeamRequestDto {
  @ApiProperty({
    description: 'The ID of the team to be deleted',
  })
  @IsString()
  teamId: string;
}
