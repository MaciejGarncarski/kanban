import { appQuery } from '@/api-client/api-client'
import { teamRoles } from '@/types/team.types'

export function useRoleByTeamId(readableTeamId: string) {
  const { data: roleData } = appQuery.useSuspenseQuery(
    'get',
    '/v1/user/{readableTeamId}/role',
    {
      params: { path: { readableTeamId } },
    },
  )

  return {
    role: roleData?.role || teamRoles.MEMBER,
    isAdmin: roleData?.role === teamRoles.ADMIN,
  }
}
