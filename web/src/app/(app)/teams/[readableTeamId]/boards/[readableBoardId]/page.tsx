import { READABLE_ID_LENGTH } from '@/constants/column'
import { prefetchCurrentUser } from '@/features/auth/api/prefetch-current-user'
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
import { prefetchAllUsers } from '@/features/users/api/prefetch-all-users'
import { TeamRole } from '@/types/team.types'
import { getQueryClient } from '@/utils/get-query-client'
import { Box, Flex, Stack } from '@mantine/core'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import * as z from 'zod/v4'

const paramsSchema = z.object({
  readableTeamId: z.string().length(READABLE_ID_LENGTH),
  readableBoardId: z.string().length(READABLE_ID_LENGTH),
})

export async function generateMetadata({
  params,
}: PageProps<'/teams/[readableTeamId]/boards/[readableBoardId]'>) {
  const awaitedParams = await params

  const { data, error } = paramsSchema.safeParse(awaitedParams)

  if (!data || error) {
    return {
      title: 'Kanban app',
    }
  }
  const queryClient = getQueryClient()
  const cookies = await attachCookies()

  const { readableBoardId } = data

  const [board] = await Promise.all([
    prefetchBoardById(queryClient, cookies, readableBoardId),
  ])

  if (!board?.name) {
    return {
      title: 'Kanban app',
    }
  }

  return {
    title: `Board ${board.name} - Kanban App`,
    description: `Viewing board ${board.name} in the Kanban application.`,
  }
}

export default async function Page({
  params,
}: PageProps<'/teams/[readableTeamId]/boards/[readableBoardId]'>) {
  const awaitedParams = await params

  const { data, error } = paramsSchema.safeParse(awaitedParams)

  if (!data) {
    return <div>Invalid parameters: {error?.message}</div>
  }
  const cookies = await attachCookies()
  const { readableTeamId, readableBoardId } = data
  const queryClient = getQueryClient()

  const [role] = await Promise.all([
    prefetchTeamRole(queryClient, cookies, readableTeamId),
    prefetchTeams(queryClient, cookies),
    prefetchBoards(queryClient, cookies, readableTeamId),
    prefetchTeamUsers(queryClient, cookies, readableTeamId),
    prefetchBoardById(queryClient, cookies, readableBoardId),
    prefetchAllUsers(queryClient, cookies),
    prefetchCurrentUser(queryClient, cookies),
  ])

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <main>
        <Flex
          justify="flex-start"
          gap={{ base: 'md', md: 'lg' }}
          align={{ base: 'center', md: 'flex-end' }}
          direction={{ base: 'column', md: 'row' }}>
          <TeamSwitch readableTeamId={readableTeamId} />
          <BoardSwitch
            readableTeamId={readableTeamId}
            readableBoardId={readableBoardId}
          />
          <Box pb={{ basae: 0, md: 1.5 }}>
            <TeamRoleBadge role={role?.role as TeamRole} />
          </Box>
          <Box ml={{ base: 0, md: 'auto' }}>
            <SettingsModal
              readableTeamId={readableTeamId}
              readableBoardId={readableBoardId}
            />
          </Box>
        </Flex>
        <Stack mt="xl">
          <Suspense fallback={<BoardPlaceholder />}>
            <ErrorBoundary fallback={<p>Failed to load board.</p>}>
              <BoardContainer
                readableTeamId={readableTeamId}
                readableBoardId={readableBoardId}
              />
            </ErrorBoundary>
          </Suspense>
        </Stack>
      </main>
    </HydrationBoundary>
  )
}
