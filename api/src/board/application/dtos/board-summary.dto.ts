import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsString, IsUUID, IsOptional, IsDate } from 'class-validator';

export class BoardSummaryDto {
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
  createdAt: string;
}
