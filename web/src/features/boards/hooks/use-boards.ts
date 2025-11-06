import { appQuery } from '@/api-client/api-client'

export function useBoards({ readableTeamId }: { readableTeamId: string }) {
  return appQuery.useSuspenseQuery('get', '/v1/teams/{readableTeamId}/boards', {
    params: { path: { readableTeamId } },
  })
}
