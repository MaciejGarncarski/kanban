import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';

export const cardSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullish(),
  position: z.number(),
  assignedTo: z.string().nullish(),
  columnId: z.string(),
  createdAt: z.coerce.date().nullish(),
  updatedAt: z.coerce.date().nullish(),
  dueDate: z.coerce.date().nullish(),
});

export class CardDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty({ required: false })
  description: string;

  @ApiProperty()
  position: number;

  @ApiProperty({ required: false })
  assignedTo: string;

  @ApiProperty()
  columnId: string;

  @ApiProperty({ required: false })
  createdAt: string;

  @ApiProperty({ required: false })
  updatedAt: string;

  @ApiProperty({ required: false })
  dueDate: Date;
}
