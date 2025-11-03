import { appQuery } from '@/api-client/api-client'
import { notifications } from '@mantine/notifications'

export function useCreateTeam() {
  return appQuery.useMutation('post', '/v1/teams', {
    onError: () => {
      notifications.show({
        title: 'Error',
        message: 'Failed to create team. Please try again.',
        color: 'red',
      })
    },
  })
}
