import { fetchServerNoMiddleware } from '@/api-client/api-client'
import { attachCookies } from '@/features/auth/utils/attach-cookies'
import { Board } from '@/features/board/components/board'
import { BoardSwitch } from '@/features/board/components/board-switch'
import { CreateTeamLink } from '@/features/layout/components/create-team-link'
import { TeamSwitchPlaceholder } from '@/features/team-switch/components/team-switch-placeholder'
import { TeamSwitchSSR } from '@/features/team-switch/components/team-switch-ssr'
import { Group, Stack, Title } from '@mantine/core'
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
      <Group>
        <Title order={1} size="32">
          Teams
        </Title>
        <CreateTeamLink />
        <Suspense fallback={<TeamSwitchPlaceholder />}>
          <TeamSwitchSSR />
        </Suspense>
      </Group>
      <Stack mt="md">
        <Group justify="between" w="100%">
          <Title size={24} order={1}>
            Welcome back, {userData.data.email}!
          </Title>
          <div style={{ marginLeft: 'auto' }}>
            <BoardSwitch />
          </div>
        </Group>
        <Board />
      </Stack>
    </main>
  )
}
