import { fetchServer } from '@/api-client/api-client'
import { READABLE_ID_LENGTH } from '@/constants/column'
import { attachCookies } from '@/features/auth/utils/attach-cookies'
import { BoardSwitch } from '@/features/boards/components/board-switch'
import { SettingsModal } from '@/features/layout/components/settings-modal'
import { TeamRoleBadge } from '@/features/teams/components/team-role-badge'
import { TeamSwitch } from '@/features/teams/components/team-switch'
import { TeamRole } from '@/types/team.types'
import { getQueryClient } from '@/utils/get-query-client'
import { Box, Group, Stack, Text } from '@mantine/core'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { redirect } from 'next/navigation'
import * as z from 'zod/v4'

const paramsSchema = z.object({
  teamId: z.string().length(READABLE_ID_LENGTH),
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

  const [role, boards] = await Promise.all([
    queryClient.fetchQuery({
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
    }),
    queryClient.fetchQuery({
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
  ])

  if (boards?.boards && boards.boards.length > 0) {
    redirect(`/teams/${teamId}/boards/${boards.boards[0]?.readableId}`)
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div>
        <Group justify="flex-start" align="flex-end">
          <TeamSwitch teamId={teamId} />
          <BoardSwitch teamId={teamId} boardId={null} />
          <TeamRoleBadge role={role?.role as TeamRole} />
          <Box ml={'auto'}>
            <SettingsModal teamId={teamId} />
          </Box>
        </Group>
        <Stack mt="md">
          {role?.role === 'admin' && (
            <Text>No boards found. Create a board to get started.</Text>
          )}
        </Stack>
      </div>
    </HydrationBoundary>
  )
}
