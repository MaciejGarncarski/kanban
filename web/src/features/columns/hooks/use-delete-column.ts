import { appQuery } from '@/api-client/api-client'

export function useDeleteColumn() {
  return appQuery.useMutation('delete', '/v1/columns/{columnId}', {
    onSuccess: (_, __, ___, ctx) => {
      ctx.client.invalidateQueries({
        queryKey: ['get', `/v1/boards/{readableTeamId}/boards`],
      })
      ctx.client.invalidateQueries({
        queryKey: ['get', '/v1/boards/{readableBoardId}'],
      })
    },
  })
}
