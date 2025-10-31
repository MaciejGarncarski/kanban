import { fetchServer } from '@/api-client/api-client'
import { attachCookies } from '@/features/auth/utils/attach-cookies'
import { BoardContainer } from '@/features/board/components/board-container'
import { BoardPlaceholder } from '@/features/board/components/board-placeholder'
import { BoardSwitch } from '@/features/board/components/board-switch'
import { CreateTeamLink } from '@/features/layout/components/create-team-link'
import { TeamSwitchPlaceholder } from '@/features/team-switch/components/team-switch-placeholder'
import { TeamSwitchSSR } from '@/features/team-switch/components/team-switch-ssr'
import { getQueryClient } from '@/utils/get-query-client'
import { Box, Group, Stack } from '@mantine/core'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import { SearchParams } from 'nuqs'
import { createLoader, parseAsString } from 'nuqs/server'
import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

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
    const paramsTeamId = { params: { path: { teamId } } }

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
        const res = await fetchServer.GET(`/v1/user/{teamId}/role`, {
          ...paramsTeamId,
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
    const paramsBoardId = { params: { path: { boardId } } }

    void queryClient.prefetchQuery({
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
    })

    void queryClient.prefetchQuery({
      queryKey: ['get', `/v1/boards/{boardId}`, paramsBoardId],
      queryFn: async () => {
        const res = await fetchServer.GET(`/v1/boards/{boardId}`, {
          ...paramsBoardId,
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
    <HydrationBoundary state={dehydrate(queryClient)}>
      <main>
        <Group justify="flex-start" align="flex-end">
          <Suspense fallback={<TeamSwitchPlaceholder />}>
            <TeamSwitchSSR />
          </Suspense>
          <Suspense fallback={<TeamSwitchPlaceholder />}>
            <ErrorBoundary fallback={<TeamSwitchPlaceholder />}>
              <BoardSwitch />
            </ErrorBoundary>
          </Suspense>
          <Box ml={'auto'}>
            <CreateTeamLink />
          </Box>
        </Group>
        <Stack mt="md">
          <Suspense fallback={<BoardPlaceholder />}>
            <ErrorBoundary fallback={<p>Failed to load board.</p>}>
              <BoardContainer />
            </ErrorBoundary>
          </Suspense>
        </Stack>
      </main>
    </HydrationBoundary>
  )
}
