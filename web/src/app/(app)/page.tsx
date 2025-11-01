import { fetchServer } from '@/api-client/api-client'
import { attachCookies } from '@/features/auth/utils/attach-cookies'
import { CreateTeamLink } from '@/features/layout/components/create-team-link'
import { getQueryClient } from '@/utils/get-query-client'
import { Box } from '@mantine/core'
import { redirect } from 'next/navigation'

export default async function Home() {
  const queryClient = getQueryClient()
  const cookies = await attachCookies()

  const teams = await queryClient.fetchQuery({
    queryKey: ['get', '/v1/teams'],

    queryFn: async () => {
      try {
        const res = await fetchServer.GET('/v1/teams', {
          headers: {
            'x-skip-jwt-middleware': 'true',
            cookie: cookies,
          },
        })

        return res.data
      } catch {
        return { teams: [] }
      }
    },
  })

  const firstTeamId = teams?.teams[0]?.readable_id

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

  const paramsTeamId = { params: { path: { teamId: firstTeamId } } }

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
    redirect(`/teams/${firstTeamId}/boards/${firstBoardId}`)
  }

  redirect(`/teams/${firstTeamId}`)
}
