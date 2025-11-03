import { fetchServer } from '@/api-client/api-client'
import { QueryClient } from '@tanstack/react-query'

export function prefetchCurrentUser(queryClient: QueryClient, cookies: string) {
  return queryClient.fetchQuery({
    queryKey: ['get', `/v1/auth/me`],
    queryFn: async () => {
      try {
        const res = await fetchServer.GET('/v1/auth/me', {
          headers: {
            'x-skip-jwt-middleware': 'true',
            cookie: cookies,
          },
        })
        return res.data || null
      } catch {
        return null
      }
    },
  })
}
