import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { ColumnDto } from 'src/column/application/dtos/column.dto';

export class BoardDetailDto {
  @ApiProperty()
  @IsUUID()
  @Expose()
  id: string;

  @ApiProperty()
  @IsString()
  @Expose()
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Expose()
  description: string;

  @ApiProperty()
  @IsUUID()
  @Expose()
  teamId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDate()
  @Expose()
  createdAt: Date;

  @ApiProperty({
    type: [ColumnDto],
    description: 'List of columns with their cards',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ColumnDto)
  @Expose()
  columns: ColumnDto[];
}
