import { fetchServerNoMiddleware } from '@/api-client/api-client'
import { QueryClient } from '@tanstack/react-query'

export function prefetchBoards(
  queryClient: QueryClient,
  cookies: string,
  readableTeamId: string,
) {
  const paramsTeamId = { params: { path: { readableTeamId } } }

  return queryClient.query({
    staleTime: 'static',
    queryKey: ['get', `/v1/teams/{readableTeamId}/boards`, paramsTeamId],
    queryFn: async () => {
      try {
        const res = await fetchServerNoMiddleware.GET(`/v1/teams/{readableTeamId}/boards`, {
          ...paramsTeamId,
          headers: {
            'x-skip-jwt-middleware': 'true',
            cookie: cookies,
          },
        })

        return res.data || { boards: [] }
      } catch {
        return { boards: [] }
      }
    },
  })
}
