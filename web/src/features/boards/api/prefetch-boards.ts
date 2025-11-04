import { fetchServer } from '@/api-client/api-client'
import { QueryClient } from '@tanstack/react-query'

export function prefetchBoards(
  queryClient: QueryClient,
  cookies: string,
  teamId: string,
) {
  const paramsTeamId = { params: { path: { teamId } } }

  return queryClient.fetchQuery({
    queryKey: ['get', `/v1/teams/{teamId}/boards`, paramsTeamId],
    queryFn: async () => {
      try {
        const res = await fetchServer.GET(`/v1/teams/{teamId}/boards`, {
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
