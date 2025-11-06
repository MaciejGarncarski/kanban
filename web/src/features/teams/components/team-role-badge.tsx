import { TeamRole, teamRoles } from '@/types/team.types'
import { Badge } from '@mantine/core'
import { UserIcon } from 'lucide-react'

export function TeamRoleBadge({ role }: { role: TeamRole }) {
  return (
    <Badge
      size="xl"
      variant={role === teamRoles.ADMIN ? 'filled' : 'light'}
      leftSection={<UserIcon size={18} />}>
      {role}
    </Badge>
  )
}
