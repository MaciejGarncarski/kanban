import { fetchServer } from '@/api-client/api-client'
import { attachCookies } from '@/features/auth/utils/attach-cookies'
import { Board } from '@/features/board/components/board'
import { BoardSwitch } from '@/features/board/components/board-switch'
import { CreateTeamLink } from '@/features/layout/components/create-team-link'
import { TeamSwitchPlaceholder } from '@/features/team-switch/components/team-switch-placeholder'
import { TeamSwitchSSR } from '@/features/team-switch/components/team-switch-ssr'
import { getQueryClient } from '@/utils/get-query-client'
import { Group, Stack, Title } from '@mantine/core'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import { SearchParams } from 'nuqs'
import { createLoader, parseAsString } from 'nuqs/server'
import { Suspense } from 'react'

type PageProps = {
  searchParams: Promise<SearchParams>
}

export const coordinatesSearchParams = {
  teamId: parseAsString,
  boardId: parseAsString,
}
export const loadSearchParams = createLoader(coordinatesSearchParams)

export default async function Home({ searchParams }: PageProps) {
  await connection()
  const { boardId, teamId } = loadSearchParams(await searchParams)
  const cookies = await attachCookies()

  const userData = await fetchServer.GET('/v1/auth/me', {
    headers: {
      'x-skip-jwt-middleware': 'true',
      cookie: cookies,
    },
  })

  if (userData.error || !userData.data) {
    redirect('/auth/sign-in')
  }

  const queryClient = getQueryClient()

  if (teamId) {
    void queryClient.prefetchQuery({
      queryKey: ['get', `/v1/teams/{teamId}/boards`],
      queryFn: async () => {
        const res = await fetchServer.GET(`/v1/teams/{teamId}/boards`, {
          params: {
            path: { teamId: teamId },
          },
          headers: {
            'x-skip-jwt-middleware': 'true',
            cookie: cookies,
          },
        })

        return res.data
      },
    })
  }

  if (boardId) {
    void queryClient.prefetchQuery({
      queryKey: ['get', `/v1/boards/{id}`],
      queryFn: async () => {
        const res = await fetchServer.GET(`/v1/boards/{id}`, {
          params: {
            path: { id: boardId },
          },
          headers: {
            'x-skip-jwt-middleware': 'true',
            cookie: cookies,
          },
        })
        return res.data
      },
    })
  }

  return (
    <main>
      <Group>
        <Title order={1} size="24">
          Teams
        </Title>
        <CreateTeamLink />
        <Suspense fallback={<TeamSwitchPlaceholder />}>
          <TeamSwitchSSR />
        </Suspense>
      </Group>
      <Stack mt="md">
        <Group justify="between" w="100%">
          <Title order={1} size="24">
            Board
          </Title>
          <Suspense fallback={<div>Loading board switcher...</div>}>
            <BoardSwitch />
          </Suspense>
        </Group>
        <Suspense fallback={<p>Loading board...</p>}>
          <HydrationBoundary state={dehydrate(queryClient)}>
            <Board />
          </HydrationBoundary>
        </Suspense>
      </Stack>
    </main>
  )
}
