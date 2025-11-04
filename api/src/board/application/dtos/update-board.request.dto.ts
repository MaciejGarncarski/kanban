import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

export class UpdateBoardRequestDto {
  @ApiProperty({ example: 'name' })
  @IsString()
  @Expose()
  name: string;

  @ApiProperty({ example: 'description' })
  @IsOptional()
  @IsString()
  @Expose()
  description?: string;
}

export class UpdateBoardParamsDto {
  @ApiProperty({
    example: '7f3b2c1e-1c4d-4f5e-8b2f-1c4d5e8b2f1c',
    description: 'Board ID',
  })
  @IsString()
  boardId: string;
}
