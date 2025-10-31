import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsOptional, IsPositive, IsString } from 'class-validator';

export class UpdateColumnRequestDto {
  @ApiProperty({ required: false, example: 'New Column Name' })
  @Expose()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false, example: 2 })
  @Expose()
  @IsOptional()
  @IsPositive()
  position?: number;
}

export class UpdateColumnParamsDto {
  @ApiProperty({ example: 'column-uuid' })
  @Expose()
  @IsString()
  columnId: string;
}
