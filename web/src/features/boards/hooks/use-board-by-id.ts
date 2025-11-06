import { appQuery } from '@/api-client/api-client'

export function useBoardById({ readableBoardId }: { readableBoardId: string }) {
  return appQuery.useSuspenseQuery('get', '/v1/boards/{readableBoardId}', {
    params: { path: { readableBoardId } },
  })
}
