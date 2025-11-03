import { appQuery } from '@/api-client/api-client'

export function useBoards({ teamId }: { teamId: string }) {
  return appQuery.useSuspenseQuery('get', '/v1/teams/{teamId}/boards', {
    params: { path: { teamId } },
  })
}
