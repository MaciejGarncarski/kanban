import { appQuery } from '@/api-client/api-client'
import { notifications } from '@mantine/notifications'

export function useEditTeam() {
  return appQuery.useMutation('patch', `/v1/teams/{readableTeamId}`, {
    onSuccess: (_, __, ___, { client }) => {
      client.invalidateQueries({ queryKey: ['get', '/v1/teams'] })
    },
    onError: (error) => {
      notifications.show({
        title: 'Error',
        message: error.message,
        color: 'red',
      })
    },
  })
}
