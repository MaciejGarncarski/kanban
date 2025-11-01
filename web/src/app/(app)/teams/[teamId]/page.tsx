import { fetchServer } from '@/api-client/api-client'
import { attachCookies } from '@/features/auth/utils/attach-cookies'
import { BoardSwitch } from '@/features/board/components/board-switch'
import { CreateTeamLink } from '@/features/layout/components/create-team-link'
import { TeamSwitch } from '@/features/team-switch/components/team-switch'
import { TeamSwitchPlaceholder } from '@/features/team-switch/components/team-switch-placeholder'
import { getQueryClient } from '@/utils/get-query-client'
import { Box, Group } from '@mantine/core'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import * as z from 'zod/v4'

const paramsSchema = z.object({
  teamId: z.string().length(8),
})

export default async function Page({
  params,
}: PageProps<'/teams/[teamId]/boards/[boardId]'>) {
  const awaitedParams = await params
  const cookies = await attachCookies()

  const { data, error } = paramsSchema.safeParse(awaitedParams)

  if (!data) {
    return <div>Invalid parameters: {error?.message}</div>
  }

  const { teamId } = data

  const queryClient = getQueryClient()
  const paramsTeamId = { params: { path: { teamId } } }

  void queryClient.prefetchQuery({
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

  void queryClient.prefetchQuery({
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

  void queryClient.prefetchQuery({
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

        return res.data
      } catch {
        return { role: 'member' }
      }
    },
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div>
        <Group justify="flex-start" align="flex-end">
          <Suspense fallback={<TeamSwitchPlaceholder />}>
            <ErrorBoundary fallback={<TeamSwitchPlaceholder />}>
              <TeamSwitch teamId={teamId} />
            </ErrorBoundary>
          </Suspense>
          <Suspense fallback={<TeamSwitchPlaceholder />}>
            <ErrorBoundary fallback={<TeamSwitchPlaceholder />}>
              <BoardSwitch teamId={teamId} boardId={null} />
            </ErrorBoundary>
          </Suspense>
          <Box ml={'auto'}>
            <CreateTeamLink />
          </Box>
        </Group>
      </div>
    </HydrationBoundary>
  )
}
