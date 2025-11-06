import { appQuery } from '@/api-client/api-client'
import { notifications } from '@mantine/notifications'

export function useCreateCard() {
  return appQuery.useMutation('post', '/v1/cards', {
    onSuccess: async (_, __, ___, ctx) => {
      await ctx.client.invalidateQueries({
        queryKey: ['get', '/v1/boards/{readableBoardId}'],
      })
      notifications.show({
        title: 'Success',
        message: 'Task created successfully',
        color: 'green',
      })
    },
    onError: (error) => {
      notifications.show({
        title: 'Error',
        message: error.message || 'Failed to create task',
        color: 'red',
      })
    },
  })
}
