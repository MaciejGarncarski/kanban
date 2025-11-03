import { fetchServer } from '@/api-client/api-client'
import { QueryClient } from '@tanstack/react-query'

export function prefetchBoardById(
  queryClient: QueryClient,
  cookies: string,
  boardId: string,
) {
  const paramsBoardId = { params: { path: { boardId } } }

  return queryClient.fetchQuery({
    queryKey: ['get', `/v1/boards/{boardId}`, paramsBoardId],
    queryFn: async () => {
      try {
        const res = await fetchServer.GET(`/v1/boards/{boardId}`, {
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
