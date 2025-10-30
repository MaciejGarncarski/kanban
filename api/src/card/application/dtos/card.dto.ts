import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsUUID,
  IsDate,
} from 'class-validator';

export class CardDto {
  @ApiProperty()
  @IsUUID()
  @Expose()
  id: string;

  @ApiProperty()
  @IsString()
  @Expose()
  title: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Expose()
  description: string;

  @ApiProperty()
  @IsNumber()
  @Expose()
  position: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  @Expose()
  assignedTo: string;

  @ApiProperty()
  @IsUUID()
  @Expose()
  columnId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDate()
  @Expose()
  createdAt: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDate()
  @Expose()
  updatedAt: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDate()
  @Expose()
  dueDate: Date;
}
