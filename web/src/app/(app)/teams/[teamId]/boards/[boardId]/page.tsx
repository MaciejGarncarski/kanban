import { READABLE_ID_LENGTH } from '@/constants/column'
import { prefetchTeamRole } from '@/features/auth/api/prefetch-team-role'
import { attachCookies } from '@/features/auth/utils/attach-cookies'
import { prefetchBoardById } from '@/features/boards/api/prefetch-board-by-id'
import { prefetchBoards } from '@/features/boards/api/prefetch-boards'
import { BoardContainer } from '@/features/boards/components/board-container'
import { BoardPlaceholder } from '@/features/boards/components/board-placeholder'
import { BoardSwitch } from '@/features/boards/components/board-switch'
import { SettingsModal } from '@/features/layout/components/settings-modal'
import { prefetchTeamUsers } from '@/features/teams/api/prefetch-team-users'
import { prefetchTeams } from '@/features/teams/api/prefetch-teams'
import { TeamRoleBadge } from '@/features/teams/components/team-role-badge'
import { TeamSwitch } from '@/features/teams/components/team-switch'
import { TeamRole } from '@/types/team.types'
import { getQueryClient } from '@/utils/get-query-client'
import { Box, Group, Stack } from '@mantine/core'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import * as z from 'zod/v4'

const paramsSchema = z.object({
  teamId: z.string().length(READABLE_ID_LENGTH),
  boardId: z.string().length(READABLE_ID_LENGTH),
})

export default async function Page({
  params,
}: PageProps<'/teams/[teamId]/boards/[boardId]'>) {
  const awaitedParams = await params

  const { data, error } = paramsSchema.safeParse(awaitedParams)

  if (!data) {
    return <div>Invalid parameters: {error?.message}</div>
  }
  const cookies = await attachCookies()
  const { teamId, boardId } = data
  const queryClient = getQueryClient()

  const [role] = await Promise.all([
    prefetchTeamRole(queryClient, cookies, teamId),
    prefetchTeams(queryClient, cookies),
    prefetchBoards(queryClient, cookies, teamId),
    prefetchTeamUsers(queryClient, cookies, teamId),
    prefetchBoardById(queryClient, cookies, boardId),
  ])

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <main>
        <Group justify="flex-start" align="flex-end">
          <TeamSwitch teamId={teamId} />
          <BoardSwitch teamId={teamId} boardId={boardId} />
          <TeamRoleBadge role={role?.role as TeamRole} />
          <Box ml={'auto'}>
            <SettingsModal teamId={teamId} boardId={boardId} />
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
