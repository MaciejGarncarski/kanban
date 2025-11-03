import { appQuery } from '@/api-client/api-client'

export function useDeleteBoard() {
  return appQuery.useMutation('delete', '/v1/boards/{boardId}', {
    onSuccess: (_, __, ___, { client }) => {
      client.invalidateQueries({ queryKey: ['get', '/v1/boards'] })
    },
  })
}
