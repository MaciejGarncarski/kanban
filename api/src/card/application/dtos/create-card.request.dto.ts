import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCardRequestDto {
  @ApiProperty({ example: 'Title' })
  @IsString()
  @Expose()
  @MaxLength(32)
  readonly title: string;

  @ApiProperty({ example: 'column-uuid' })
  @IsString()
  @Expose()
  readonly columnId: string;

  @ApiProperty({ example: 'Description', required: false })
  @IsString()
  @IsOptional()
  @Expose()
  @MaxLength(500)
  readonly description?: string;

  @ApiProperty({ example: '2023-01-01', required: false })
  @IsString()
  @IsOptional()
  @Expose()
  readonly dueDate?: string;

  @ApiProperty({ example: 'user-uuid', required: false })
  @IsString()
  @IsOptional()
  @Expose()
  readonly assignedTo?: string;
}
