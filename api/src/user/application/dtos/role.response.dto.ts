import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';
import { teamRoles } from 'src/team/domain/types/team.types';

export class RoleResponseDto {
  @ApiProperty({ enum: [teamRoles.ADMIN, teamRoles.MEMBER] })
  @Expose()
  @IsString()
  role: string;
}
