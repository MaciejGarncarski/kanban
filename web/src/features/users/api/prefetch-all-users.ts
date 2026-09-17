import { fetchServerNoMiddleware } from '@/api-client/api-client'
import { QueryClient } from '@tanstack/react-query'

export function prefetchAllUsers(queryClient: QueryClient, cookies: string) {
  return queryClient.query({
    staleTime: 'static',
    queryKey: ['get', '/v1/user/all'],
    queryFn: async () => {
      try {
        const res = await fetchServerNoMiddleware.GET('/v1/user/all', {
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
