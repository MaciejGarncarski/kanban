import { appQuery } from '@/api-client/api-client'

export function useTeamUsers({ readableTeamId }: { readableTeamId: string }) {
  return appQuery.useSuspenseQuery('get', '/v1/teams/{readableTeamId}/users', {
    params: {
      path: {
        readableTeamId,
      },
    },
  })
}
