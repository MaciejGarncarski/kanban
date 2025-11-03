import { appQuery } from '@/api-client/api-client'
import { notifications } from '@mantine/notifications'

export function useCreateColumn() {
  return appQuery.useMutation('post', '/v1/columns', {
    onSuccess: (_, __, ___, ctx) => {
      ctx.client.invalidateQueries({
        queryKey: ['get', '/v1/boards/{boardId}'],
      })
      notifications.show({
        title: 'Success',
        message: 'Column created successfully',
        color: 'green',
      })
    },
    onError: (error) => {
      notifications.show({
        title: 'Error',
        message: error.message || 'Failed to create column',
        color: 'red',
      })
    },
  })
}
