import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';
import {
  CardDto,
  cardSchema,
} from '../../../card/application/dtos/card.dto.js';

export const columnSchema = z.object({
  id: z.string(),
  boardId: z.string(),
  name: z.string(),
  position: z.number(),
  createdAt: z.coerce.date().nullish(),
  cards: z.array(cardSchema),
});

export class ColumnDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  boardId: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  position: number;

  @ApiProperty({
    example: '2025-10-17T15:42:05.351Z',
    description: 'User account creation date',
  })
  createdAt: string;

  @ApiProperty({ type: [CardDto] })
  cards: CardDto[];
}
