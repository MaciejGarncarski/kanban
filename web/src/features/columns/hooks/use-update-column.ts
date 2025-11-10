import { appQuery } from '@/api-client/api-client'
import { notifications } from '@mantine/notifications'

export function useUpdateColumn() {
  return appQuery.useMutation('patch', '/v1/columns/{columnId}', {
    onSuccess: (_, __, ___, ctx) => {
      ctx.client.invalidateQueries({
        queryKey: ['get', `/v1/boards/{readableTeamId}/boards`],
      })
      ctx.client.invalidateQueries({
        queryKey: ['get', '/v1/boards/{readableBoardId}'],
      })
    },
    onError: (error) => {
      notifications.show({
        title: 'Error updating column',
        message: error.message,
        color: 'red',
      })
    },
  })
}
