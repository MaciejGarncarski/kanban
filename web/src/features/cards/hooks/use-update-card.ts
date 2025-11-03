import { appQuery } from '@/api-client/api-client'
import { notifications } from '@mantine/notifications'

export function useUpdateCard() {
  return appQuery.useMutation('patch', '/v1/cards/{cardId}', {
    onSuccess: (_, __, ___, { client }) => {
      client.invalidateQueries({
        queryKey: ['get', '/v1/boards/{boardId}'],
      })
      notifications.show({
        title: 'Success',
        message: 'Task updated successfully',
        color: 'green',
      })
    },
  })
}
