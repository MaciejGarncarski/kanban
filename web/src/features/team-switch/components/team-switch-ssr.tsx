import { fetchServer } from '@/api-client/api-client'
import { attachCookies } from '@/features/auth/utils/attach-cookies'
import { TeamSwitch } from '@/features/team-switch/components/team-switch'
import { getQueryClient } from '@/utils/get-query-client'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { connection } from 'next/server'

export async function TeamSwitchSSR() {
  await connection()
  const queryClient = getQueryClient()

  void queryClient.prefetchQuery({
    queryKey: ['get', '/v1/teams'],

    queryFn: async () => {
      const res = await fetchServer.GET('/v1/teams', {
        headers: {
          'x-skip-jwt-middleware': 'true',
          cookie: await attachCookies(),
        },
      })

      return res.data
    },
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TeamSwitch />
    </HydrationBoundary>
  )
}
