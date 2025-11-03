import { fetchServer } from '@/api-client/api-client'
import { QueryClient } from '@tanstack/react-query'

export function prefetchTeamRole(
  queryClient: QueryClient,
  cookies: string,
  teamId: string,
) {
  const paramsTeamId = { params: { path: { teamId } } }

  return queryClient.fetchQuery({
    queryKey: ['get', `/v1/user/{teamId}/role`, paramsTeamId],
    queryFn: async () => {
      try {
        const res = await fetchServer.GET(`/v1/user/{teamId}/role`, {
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
