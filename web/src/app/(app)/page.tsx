import { attachCookies } from '@/features/auth/utils/attach-cookies'
import { prefetchBoards } from '@/features/boards/api/prefetch-boards'
import { CreateTeamLink } from '@/features/layout/components/create-team-link'
import { prefetchTeams } from '@/features/teams/api/prefetch-teams'
import { getQueryClient } from '@/utils/get-query-client'
import { Box } from '@mantine/core'
import { redirect } from 'next/navigation'

export default async function Home() {
  const queryClient = getQueryClient()
  const cookies = await attachCookies()
  const teams = await prefetchTeams(queryClient, cookies)

  const firstTeamId = teams?.teams[0]?.readableId

  if (!teams || teams?.teams.length === 0 || !firstTeamId) {
    return (
      <main>
        <Box mt="md">
          You are not a member of any team. Create a team to get started.
        </Box>
        <Box>
          <CreateTeamLink />
        </Box>
      </main>
    )
  }

  const boards = await prefetchBoards(queryClient, cookies, firstTeamId)

  const firstBoardId =
    (boards?.boards?.length || 0) > 0 ? boards?.boards[0]?.readableId : null

  if (firstBoardId) {
    redirect(`/teams/${firstTeamId}/boards/${firstBoardId}`)
  }

  redirect(`/teams/${firstTeamId}`)
}
