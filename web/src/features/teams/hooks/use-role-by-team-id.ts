import { appQuery } from '@/api-client/api-client'
import { teamRoles } from '@/types/team.types'

export function useRoleByTeamId(teamId: string) {
  const { data: roleData } = appQuery.useSuspenseQuery(
    'get',
    '/v1/user/{teamId}/role',
    {
      params: { path: { teamId } },
    },
  )

  return {
    role: roleData?.role || teamRoles.MEMBER,
    isAdmin: roleData?.role === teamRoles.ADMIN,
  }
}
