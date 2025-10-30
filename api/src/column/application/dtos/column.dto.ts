import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import {
  IsString,
  IsUUID,
  IsNumber,
  IsArray,
  ValidateNested,
  IsOptional,
  IsDate,
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

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDate()
  @Expose()
  createdAt: Date;

  @ApiProperty({ type: [CardDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CardDto)
  @Expose()
  cards: CardDto[];
}
