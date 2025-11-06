import { READABLE_ID_LENGTH } from '@/constants/column'
import { prefetchCurrentUser } from '@/features/auth/api/prefetch-current-user'
import { prefetchTeamRole } from '@/features/auth/api/prefetch-team-role'
import { attachCookies } from '@/features/auth/utils/attach-cookies'
import { prefetchBoards } from '@/features/boards/api/prefetch-boards'
import { BoardSwitch } from '@/features/boards/components/board-switch'
import { SettingsModal } from '@/features/layout/components/settings-modal'
import { prefetchTeamUsers } from '@/features/teams/api/prefetch-team-users'
import { prefetchTeams } from '@/features/teams/api/prefetch-teams'
import { TeamRoleBadge } from '@/features/teams/components/team-role-badge'
import { TeamSwitch } from '@/features/teams/components/team-switch'
import { prefetchAllUsers } from '@/features/users/api/prefetch-all-users'
import { TeamRole } from '@/types/team.types'
import { getQueryClient } from '@/utils/get-query-client'
import { Box, Group, Stack, Text } from '@mantine/core'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { redirect } from 'next/navigation'
import * as z from 'zod/v4'

const paramsSchema = z.object({
  readableTeamId: z.string().length(READABLE_ID_LENGTH),
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

  const { readableTeamId } = data
  const queryClient = getQueryClient()

  const [role, boards] = await Promise.all([
    prefetchTeamRole(queryClient, cookies, readableTeamId),
    prefetchBoards(queryClient, cookies, readableTeamId),
    prefetchTeamUsers(queryClient, cookies, readableTeamId),
    prefetchTeams(queryClient, cookies),
    prefetchAllUsers(queryClient, cookies),
    prefetchCurrentUser(queryClient, cookies),
  ])

  if (boards?.boards && boards.boards.length > 0) {
    redirect(`/teams/${readableTeamId}/boards/${boards.boards[0]?.readableId}`)
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div>
        <Group justify="flex-start" align="flex-end">
          <TeamSwitch readableTeamId={readableTeamId} />
          <BoardSwitch readableTeamId={readableTeamId} readableBoardId={null} />
          <TeamRoleBadge role={role?.role as TeamRole} />
          <Box ml={'auto'}>
            <SettingsModal readableTeamId={readableTeamId} />
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
