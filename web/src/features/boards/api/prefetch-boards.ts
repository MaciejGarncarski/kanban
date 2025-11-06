import { fetchServer } from '@/api-client/api-client'
import { QueryClient } from '@tanstack/react-query'

export function prefetchBoards(
  queryClient: QueryClient,
  cookies: string,
  readableTeamId: string,
) {
  const paramsTeamId = { params: { path: { readableTeamId } } }

  return queryClient.fetchQuery({
    queryKey: ['get', `/v1/teams/{readableTeamId}/boards`, paramsTeamId],
    queryFn: async () => {
      try {
        const res = await fetchServer.GET(`/v1/teams/{readableTeamId}/boards`, {
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
