import { fetchServerNoMiddleware } from '@/api-client/api-client'
import { QueryClient } from '@tanstack/react-query'

export function prefetchBoardById(
  queryClient: QueryClient,
  cookies: string,
  readableBoardId: string,
) {
  const paramsBoardId = { params: { path: { readableBoardId } } }

  return queryClient.query({
    staleTime: 'static',
    queryKey: ['get', `/v1/boards/{readableBoardId}`, paramsBoardId],
    queryFn: async () => {
      try {
        const res = await fetchServerNoMiddleware.GET(`/v1/boards/{readableBoardId}`, {
          ...paramsBoardId,
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
