import { fetchServerNoMiddleware } from '@/api-client/api-client'
import { attachCookies } from '@/features/auth/utils/attach-cookies'
import { Board } from '@/features/board/components/board'
import { TeamSwitchPlaceholder } from '@/features/team-switch/components/team-switch-placeholder'
import { TeamSwitchSSR } from '@/features/team-switch/components/team-switch-ssr'
import { Flex, Group } from '@mantine/core'
import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import { Suspense } from 'react'

export default async function Home() {
  await connection()

  const userData = await fetchServerNoMiddleware.GET('/v1/auth/me', {
    headers: {
      cookie: await attachCookies(),
    },
  })

  if (userData.error || !userData.data) {
    redirect('/auth/sign-in')
  }

  return (
    <main>
      <Group justify="between" w="100%">
        <h1>Welcome back, {userData.data.email}!</h1>
        <div style={{ marginLeft: 'auto' }}>
          <Suspense fallback={<TeamSwitchPlaceholder />}>
            <TeamSwitchSSR />
          </Suspense>
        </div>
      </Group>
      <Board />
    </main>
  )
}
