import { fetchServer } from '@/api-client/api-client'
import { READABLE_ID_LENGTH } from '@/constants/column'
import { attachCookies } from '@/features/auth/utils/attach-cookies'
import { getQueryClient } from '@/utils/get-query-client'
import { redirect } from 'next/navigation'
import * as z from 'zod/v4'

const paramsSchema = z.object({
  teamId: z.string().length(READABLE_ID_LENGTH),
})

export default async function Page({
  params,
}: PageProps<'/teams/[teamId]/boards'>) {
  const awaitedParams = await params
  const { data } = paramsSchema.safeParse(awaitedParams)

  if (!data) {
    redirect(`/`)
  }

  const queryClient = getQueryClient()
  const paramsTeamId = { params: { path: { teamId: data.teamId } } }
  const cookies = await attachCookies()

  const boards = await queryClient.fetchQuery({
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

        return res.data
      } catch {
        return { boards: [] }
      }
    },
  })

  const firstBoardId = boards?.boards[0]?.readableId

  if (firstBoardId) {
    redirect(`/teams/${data.teamId}/boards/${firstBoardId}`)
  }

  redirect(`/teams/${data.teamId}/`)
}
