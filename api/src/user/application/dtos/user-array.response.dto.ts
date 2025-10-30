import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { UserResponseDto } from 'src/user/application/dtos/user.response.dto';

export class UserArrayResponseDto {
  @ApiProperty({
    type: [UserResponseDto],
    description: 'Array of users',
  })
  @Type(() => UserResponseDto)
  @Expose()
  users: UserResponseDto[];
}
