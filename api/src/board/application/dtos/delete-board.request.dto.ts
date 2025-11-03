import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteBoardRequestDto {
  @ApiProperty({
    description: 'The ID of the board to delete',
    example: 'board-123',
  })
  @IsString()
  @IsNotEmpty()
  boardId: string;
}
