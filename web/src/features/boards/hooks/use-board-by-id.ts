import { appQuery } from '@/api-client/api-client'

export function useBoardById({ boardId }: { boardId: string }) {
  return appQuery.useSuspenseQuery('get', '/v1/boards/{boardId}', {
    params: { path: { boardId } },
  })
}
