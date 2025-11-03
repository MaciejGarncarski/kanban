import { appQuery } from '@/api-client/api-client'

export function useTeamUsers({ teamId }: { teamId: string }) {
  return appQuery.useSuspenseQuery('get', '/v1/teams/{teamId}/users', {
    params: {
      path: {
        teamId,
      },
    },
  })
}
