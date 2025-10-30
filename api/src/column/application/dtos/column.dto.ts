import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import {
  IsString,
  IsUUID,
  IsNumber,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { CardDto } from 'src/card/application/dtos/card.dto';

export class ColumnDto {
  @ApiProperty()
  @IsUUID()
  @Expose()
  id: string;

  @ApiProperty()
  @IsUUID()
  @Expose()
  boardId: string;

  @ApiProperty()
  @IsString()
  @Expose()
  name: string;

  @ApiProperty()
  @IsNumber()
  @Expose()
  position: number;

  @ApiProperty({
    example: '2025-10-17T15:42:05.351Z',
    description: 'User account creation date',
  })
  @Expose()
  @Type(() => Date)
  createdAt: string;

  @ApiProperty({ type: [CardDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CardDto)
  @Expose()
  cards: CardDto[];
}
