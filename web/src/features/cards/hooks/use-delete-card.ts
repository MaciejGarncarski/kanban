import { appQuery } from '@/api-client/api-client'

export function useDeleteCard() {
  return appQuery.useMutation('delete', '/v1/cards/{cardId}', {
    onSuccess: (_, __, ___, context) => {
      context.client.invalidateQueries({
        queryKey: ['get', '/v1/boards/{readableBoardId}'],
      })
    },
  })
}
