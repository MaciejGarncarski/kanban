import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export class CreateColumnRequestDto {
  @ApiProperty({ example: 'To Do', description: 'Title of the column' })
  @IsString()
  @MaxLength(20)
  title: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID of the board the column belongs to',
  })
  @IsString()
  readableBoardId: string;
}
