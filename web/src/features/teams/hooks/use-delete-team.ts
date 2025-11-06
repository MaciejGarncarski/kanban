import { appQuery } from '@/api-client/api-client'

export function useDeleteTeam() {
  return appQuery.useMutation('delete', `/v1/teams/{readableTeamId}`, {
    onSuccess: (_, __, ___, { client }) => {
      client.invalidateQueries({ queryKey: ['get', '/v1/teams'] })
    },
  })
}
