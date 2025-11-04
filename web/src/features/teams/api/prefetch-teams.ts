import { fetchServer } from '@/api-client/api-client'
import { QueryClient } from '@tanstack/react-query'

export function prefetchTeams(queryClient: QueryClient, cookies: string) {
  return queryClient.fetchQuery({
    queryKey: ['get', '/v1/teams'],

    queryFn: async () => {
      try {
        const res = await fetchServer.GET('/v1/teams', {
          headers: {
            'x-skip-jwt-middleware': 'true',
            cookie: cookies,
          },
        })

        return res.data || { teams: [] }
      } catch {
        return { teams: [] }
      }
    },
  })
}
