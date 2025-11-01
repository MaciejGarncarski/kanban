import { fetchServer } from '@/api-client/api-client'
import { attachCookies } from '@/features/auth/utils/attach-cookies'
import { BoardSwitch } from '@/features/board/components/board-switch'
import { CreateTeamLink } from '@/features/layout/components/create-team-link'
import { TeamSwitch } from '@/features/team-switch/components/team-switch'
import { TeamSwitchPlaceholder } from '@/features/team-switch/components/team-switch-placeholder'
import { getQueryClient } from '@/utils/get-query-client'
import { Box, Group } from '@mantine/core'
import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

export default async function Home() {
  const queryClient = getQueryClient()

  void queryClient.prefetchQuery({
    queryKey: ['get', '/v1/teams'],

    queryFn: async () => {
      try {
        const res = await fetchServer.GET('/v1/teams', {
          headers: {
            'x-skip-jwt-middleware': 'true',
            cookie: await attachCookies(),
          },
        })

        return res.data
      } catch {
        return { teams: [] }
      }
    },
  })

  return (
    <main>
      <Group justify="flex-start" align="flex-end">
        <Suspense fallback={<TeamSwitchPlaceholder />}>
          <ErrorBoundary fallback={<TeamSwitchPlaceholder />}>
            <TeamSwitch teamId={null} />
          </ErrorBoundary>
        </Suspense>
        <Suspense fallback={<TeamSwitchPlaceholder />}>
          <ErrorBoundary fallback={<TeamSwitchPlaceholder />}>
            <BoardSwitch teamId={null} boardId={null} />
          </ErrorBoundary>
        </Suspense>
        <Box ml={'auto'}>
          <CreateTeamLink />
        </Box>
      </Group>
    </main>
  )
}
