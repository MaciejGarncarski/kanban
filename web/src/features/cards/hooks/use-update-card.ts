import { appQuery } from '@/api-client/api-client'

export function useUpdateCard() {
  return appQuery.useMutation('patch', '/v1/cards/{cardId}', {
    onSuccess: (_, __, ___, { client }) => {
      client.invalidateQueries({
        queryKey: ['get', '/v1/boards/{boardId}'],
      })
    },
  })
}
