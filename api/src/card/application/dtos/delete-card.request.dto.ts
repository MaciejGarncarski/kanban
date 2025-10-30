import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';

export class DeleteCardRequestDto {
  @ApiProperty({ example: 'uuid' })
  @IsString()
  @Expose()
  readonly cardId: string;
}
