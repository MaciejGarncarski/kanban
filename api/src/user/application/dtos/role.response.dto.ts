import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';
import { teamRoles } from '../../../team/domain/types/team.types.js';

export const roleResponseSchema = z.object({
  role: z.string(),
});

export class RoleResponseDto {
  @ApiProperty({ enum: [teamRoles.ADMIN, teamRoles.MEMBER] })
  role: string;
}
