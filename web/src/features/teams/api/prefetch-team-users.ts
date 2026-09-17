import { fetchServerNoMiddleware } from '@/api-client/api-client'
import { QueryClient } from '@tanstack/react-query'

export function prefetchTeamUsers(
  queryClient: QueryClient,
  cookies: string,
  readableTeamId: string,
) {
  const paramsTeamId = { params: { path: { readableTeamId: readableTeamId } } }

  return queryClient.query({
    staleTime: 'static',
    queryKey: ['get', `/v1/teams/{readableTeamId}/users`, paramsTeamId],
    queryFn: async () => {
      try {
        const res = await fetchServerNoMiddleware.GET('/v1/teams/{readableTeamId}/users', {
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
