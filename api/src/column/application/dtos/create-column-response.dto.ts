import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import {
  IsDate,
  IsOptional,
  IsPositive,
  isString,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateColumnResponseDto {
  @Expose({ name: 'id' })
  @IsUUID()
  @ApiProperty({ name: 'id', example: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6' })
  id: string;

  @Expose({ name: 'name' })
  @ApiProperty({ name: 'name', example: 'To Do' })
  @IsString()
  name: string;

  @Expose()
  @Transform(({ obj }) => obj.board_id, { toClassOnly: true })
  @ApiProperty({
    name: 'boardId',
    example: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
  })
  @IsString()
  boardId: string;

  @Expose({ name: 'created_at' })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  createdAt: Date;

  @Expose({ name: 'position' })
  @IsPositive()
  @ApiProperty({ example: 1 })
  position: number;
}
