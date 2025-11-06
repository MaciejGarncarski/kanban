import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateBoardRequestDto {
  @ApiProperty({
    description: 'Name of the board',
    example: 'Project Roadmap',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Description of the board',
    example: 'A detailed description of the project roadmap',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'ID of the team to which the board belongs',
    example: 'team-12345',
  })
  @IsString()
  readableTeamId: string;
}
