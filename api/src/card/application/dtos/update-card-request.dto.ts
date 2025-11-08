import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsOptional, IsPositive, IsString, MaxLength } from 'class-validator';

export class UpdateCardParamDto {
  @ApiProperty({ example: 'card-uuid' })
  @Expose()
  @IsString()
  cardId: string;
}

export class UpdateCardRequestDto {
  @ApiProperty({ example: 'New Title', required: false })
  @IsString()
  @Expose()
  @IsOptional()
  @MaxLength(32, { message: 'Title is too long' })
  readonly title?: string;

  @ApiProperty({ example: 'New Description', required: false })
  @IsString()
  @Expose()
  @IsOptional()
  @MaxLength(500, { message: 'Description is too long' })
  readonly description?: string;

  @ApiProperty({ example: '2024-12-31', required: false })
  @IsString()
  @Expose()
  @IsOptional()
  readonly dueDate?: string;

  @ApiProperty({ example: 'user-uuid', required: false })
  @IsString()
  @Expose()
  @IsOptional()
  readonly assignedTo?: string;

  @ApiProperty({ example: 3, required: false })
  @IsPositive()
  @Expose()
  @IsOptional()
  readonly position?: number;

  @ApiProperty({ example: 'column-uuid', required: false })
  @IsString()
  @Expose()
  @IsOptional()
  readonly columnId?: string;
}
