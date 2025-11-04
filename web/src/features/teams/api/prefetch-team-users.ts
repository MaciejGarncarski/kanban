import { fetchServer } from '@/api-client/api-client'
import { QueryClient } from '@tanstack/react-query'

export function prefetchTeamUsers(
  queryClient: QueryClient,
  cookies: string,
  teamId: string,
) {
  const paramsTeamId = { params: { path: { teamId } } }

  return queryClient.fetchQuery({
    queryKey: ['get', `/v1/teams/{teamId}/users`, paramsTeamId],
    queryFn: async () => {
      try {
        const res = await fetchServer.GET('/v1/teams/{teamId}/users', {
          ...paramsTeamId,
          headers: {
            'x-skip-jwt-middleware': 'true',
            cookie: cookies,
          },
        })

        return res.data || { users: [] }
      } catch {
        return { users: [] }
      }
    },
  })
}
