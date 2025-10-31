import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class GetBoardByIdDto {
  @ApiProperty({
    example: '7f3b2c1e-1c4d-4f5e-8b2f-1c4d5e8b2f1c',
    description: 'Board ID',
  })
  @IsString()
  boardId: string;
}
