import { fetchServer } from '@/api-client/api-client'
import { QueryClient } from '@tanstack/react-query'

export function prefetchTeamRole(
  queryClient: QueryClient,
  cookies: string,
  readableTeamId: string,
) {
  const paramsTeamId = { params: { path: { readableTeamId } } }

  return queryClient.fetchQuery({
    queryKey: ['get', `/v1/user/{readableTeamId}/role`, paramsTeamId],
    queryFn: async () => {
      try {
        const res = await fetchServer.GET(`/v1/user/{readableTeamId}/role`, {
          ...paramsTeamId,
          headers: {
            'x-skip-jwt-middleware': 'true',
            cookie: cookies,
          },
        })

        if (!res.data) {
          return { role: 'member' }
        }

        return res.data
      } catch {
        return { role: 'member' }
      }
    },
  })
}
