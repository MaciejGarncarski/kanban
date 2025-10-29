import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { BoardDto } from 'src/board/application/dtos/board.dto';

export class GetBoardsByTeamResponseDto {
  @ApiProperty({ type: [BoardDto], description: 'List of boards for the team' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BoardDto)
  @Expose()
  boards: BoardDto[];
}
