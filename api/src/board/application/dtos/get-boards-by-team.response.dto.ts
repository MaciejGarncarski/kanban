import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';
import { BoardSummaryDto, boardSummarySchema } from './board-summary.dto.js';

export const getBoardsByTeamResponseSchema = z.object({
  boards: z.array(boardSummarySchema),
});

export class GetBoardsByTeamResponseDto {
  @ApiProperty({
    type: [BoardSummaryDto],
    description: 'List of boards for the team',
  })
  boards: BoardSummaryDto[];
}
