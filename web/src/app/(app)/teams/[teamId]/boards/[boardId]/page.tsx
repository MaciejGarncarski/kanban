import { fetchServer } from '@/api-client/api-client'
import { attachCookies } from '@/features/auth/utils/attach-cookies'
import { BoardContainer } from '@/features/board/components/board-container'
import { BoardPlaceholder } from '@/features/board/components/board-placeholder'
import { BoardSwitch } from '@/features/board/components/board-switch'
import { CreateTeamLink } from '@/features/layout/components/create-team-link'
import { TeamSwitch } from '@/features/team-switch/components/team-switch'
import { TeamSwitchPlaceholder } from '@/features/team-switch/components/team-switch-placeholder'
import { getQueryClient } from '@/utils/get-query-client'
import { Badge, Box, Group, Stack } from '@mantine/core'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import * as z from 'zod/v4'

const paramsSchema = z.object({
  teamId: z.string().length(8),
  boardId: z.string().length(8),
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

  const queryClient = getQueryClient()

  const { teamId, boardId } = data

  const paramsBoardId = { params: { path: { boardId } } }
  const paramsTeamId = { params: { path: { teamId } } }

  const role = await queryClient.fetchQuery({
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

  await Promise.all([
    queryClient.prefetchQuery({
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
    }),
    queryClient.prefetchQuery({
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
    }),
    queryClient.prefetchQuery({
      queryKey: ['get', `/v1/boards/{boardId}/users`, paramsBoardId],
      queryFn: async () => {
        try {
          const res = await fetchServer.GET('/v1/boards/{boardId}/users', {
            ...paramsBoardId,
            headers: {
              'x-skip-jwt-middleware': 'true',
              cookie: cookies,
            },
          })
          return res.data
        } catch {
          return { users: [] }
        }
      },
    }),
    queryClient.prefetchQuery({
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
          return res.data
        } catch {
          return null
        }
      },
    }),
  ])

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <main>
        <Group justify="flex-start" align="flex-end">
          <Suspense fallback={<TeamSwitchPlaceholder />}>
            <ErrorBoundary fallback={<TeamSwitchPlaceholder />}>
              <TeamSwitch teamId={teamId} />
            </ErrorBoundary>
          </Suspense>
          <Suspense fallback={<TeamSwitchPlaceholder />}>
            <ErrorBoundary fallback={<TeamSwitchPlaceholder />}>
              <BoardSwitch teamId={teamId} boardId={boardId} />
            </ErrorBoundary>
          </Suspense>
          <Badge size="lg">Role: {role?.role ?? 'member'}</Badge>
          <Box ml={'auto'}>
            <CreateTeamLink />
          </Box>
        </Group>
        <Stack mt="md">
          <Suspense fallback={<BoardPlaceholder />}>
            <ErrorBoundary fallback={<p>Failed to load board.</p>}>
              <BoardContainer teamId={teamId} boardId={boardId} />
            </ErrorBoundary>
          </Suspense>
        </Stack>
      </main>
    </HydrationBoundary>
  )
}
