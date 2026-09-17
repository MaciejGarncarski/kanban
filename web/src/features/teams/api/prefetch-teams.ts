import { fetchServerNoMiddleware } from '@/api-client/api-client'
import { QueryClient } from '@tanstack/react-query'

export function prefetchTeams(queryClient: QueryClient, cookies: string) {
  return queryClient.query({
    staleTime: 'static',
    queryKey: ['get', '/v1/teams'],

    queryFn: async () => {
      try {
        const res = await fetchServerNoMiddleware.GET('/v1/teams', {
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
