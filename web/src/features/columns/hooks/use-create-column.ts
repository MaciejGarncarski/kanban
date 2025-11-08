import { appQuery } from '@/api-client/api-client'
import { notifications } from '@mantine/notifications'

export function useCreateColumn() {
  return appQuery.useMutation('post', '/v1/columns', {
    onSuccess: (_, __, ___, ctx) => {
      ctx.client.invalidateQueries({
        queryKey: ['get', '/v1/boards/{readableBoardId}'],
      })
      notifications.show({
        title: 'Success',
        message: 'Column created successfully',
        color: 'green',
        withBorder: true,
        radius: 'lg',
      })
    },
    onError: (error) => {
      notifications.show({
        title: 'Error',
        message: error.message || 'Failed to create column',
        color: 'red',
        withBorder: true,
        radius: 'lg',
      })
    },
  })
}
