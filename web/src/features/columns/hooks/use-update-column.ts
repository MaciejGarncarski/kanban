import { appQuery } from '@/api-client/api-client'

export function useUpdateColumn() {
  return appQuery.useMutation('patch', '/v1/columns/{columnId}', {
    onSuccess: (_, __, ___, ctx) => {
      ctx.client.invalidateQueries({
        queryKey: ['get', `/v1/boards/{teamId}/boards`],
      })
      ctx.client.invalidateQueries({
        queryKey: ['get', '/v1/boards/{boardId}'],
      })
    },
  })
}
