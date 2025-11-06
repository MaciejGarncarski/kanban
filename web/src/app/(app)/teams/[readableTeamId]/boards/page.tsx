import { READABLE_ID_LENGTH } from '@/constants/column'
import { attachCookies } from '@/features/auth/utils/attach-cookies'
import { prefetchBoards } from '@/features/boards/api/prefetch-boards'
import { getQueryClient } from '@/utils/get-query-client'
import { redirect } from 'next/navigation'
import * as z from 'zod/v4'

const paramsSchema = z.object({
  readableTeamId: z.string().length(READABLE_ID_LENGTH),
})

export default async function Page({
  params,
}: PageProps<'/teams/[readableTeamId]/boards'>) {
  const awaitedParams = await params
  const { data } = paramsSchema.safeParse(awaitedParams)

  if (!data) {
    redirect(`/`)
  }

  const queryClient = getQueryClient()
  const cookies = await attachCookies()
  const boards = await prefetchBoards(queryClient, cookies, data.readableTeamId)

  const firstBoardId = boards?.boards[0]?.readableId

  if (firstBoardId) {
    redirect(`/teams/${data.readableTeamId}/boards/${firstBoardId}`)
  }

  redirect(`/teams/${data.readableTeamId}/`)
}
