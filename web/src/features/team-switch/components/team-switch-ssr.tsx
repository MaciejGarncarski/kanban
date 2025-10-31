import { fetchServer } from '@/api-client/api-client'
import { attachCookies } from '@/features/auth/utils/attach-cookies'
import { TeamSwitch } from '@/features/team-switch/components/team-switch'
import { TeamSwitchPlaceholder } from '@/features/team-switch/components/team-switch-placeholder'
import { getQueryClient } from '@/utils/get-query-client'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { connection } from 'next/server'
import { ErrorBoundary } from 'react-error-boundary'

export async function TeamSwitchSSR() {
  await connection()
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
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ErrorBoundary fallback={<TeamSwitchPlaceholder />}>
        <TeamSwitch />
      </ErrorBoundary>
    </HydrationBoundary>
  )
}
