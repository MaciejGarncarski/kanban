import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { BoardSummaryDto } from 'src/board/application/dtos/board-summary.dto';

export class GetBoardsByTeamResponseDto {
  @ApiProperty({
    type: [BoardSummaryDto],
    description: 'List of boards for the team',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BoardSummaryDto)
  @Expose()
  boards: BoardSummaryDto[];
}
