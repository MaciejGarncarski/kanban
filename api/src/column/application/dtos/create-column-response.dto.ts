import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsPositive, IsString, IsUUID } from 'class-validator';

export class CreateColumnResponseDto {
  @Expose()
  @IsUUID()
  @ApiProperty({ name: 'id', example: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6' })
  id: string;

  @Expose()
  @ApiProperty({ name: 'name', example: 'To Do' })
  @IsString()
  name: string;

  @Expose()
  @ApiProperty({
    name: 'boardId',
    example: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
  })
  @IsString()
  boardId: string;

  @Expose()
  @ApiProperty({
    example: '2025-10-17T15:42:05.351Z',
    description: 'User account creation date',
  })
  @Expose()
  @Type(() => Date)
  createdAt: string;

  @Expose()
  @IsPositive()
  @ApiProperty({ example: 1 })
  position: number;
}
