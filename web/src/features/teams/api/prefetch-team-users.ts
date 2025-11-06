import { fetchServer } from '@/api-client/api-client'
import { QueryClient } from '@tanstack/react-query'

export function prefetchTeamUsers(
  queryClient: QueryClient,
  cookies: string,
  readableTeamId: string,
) {
  const paramsTeamId = { params: { path: { readableTeamId: readableTeamId } } }

  return queryClient.fetchQuery({
    queryKey: ['get', `/v1/teams/{readableTeamId}/users`, paramsTeamId],
    queryFn: async () => {
      try {
        const res = await fetchServer.GET('/v1/teams/{readableTeamId}/users', {
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
