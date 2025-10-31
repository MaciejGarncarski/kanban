import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteColumnRequestDto {
  @ApiProperty({
    example: 'column-12345',
  })
  @IsString()
  @IsNotEmpty()
  @Expose()
  columnId: string;
}
