import { appQuery } from '@/api-client/api-client'
import { notifications } from '@mantine/notifications'

export function useUpdateBoard() {
  return appQuery.useMutation('patch', '/v1/boards/{boardId}', {
    onError: (error) => {
      notifications.show({
        title: 'Error',
        message: error.message,
        color: 'red',
      })
    },
    onSuccess: (_, __, ___, { client }) => {
      notifications.show({
        title: 'Success',
        message: 'Board updated',
        color: 'green',
      })

      client.invalidateQueries({
        queryKey: ['get', '/v1/teams/{teamId}/boards'],
      })
      client.invalidateQueries({
        queryKey: ['get', '/v1/boards/{boardId}'],
      })
    },
  })
}
