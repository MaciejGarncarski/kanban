import { fetchServerNoMiddleware } from '@/api-client/api-client'
import { attachCookies } from '@/features/auth/utils/attach-cookies'
import { connection } from 'next/server'

export default async function Home() {
  await connection()

  const userData = await fetchServerNoMiddleware.GET('/v1/auth/me', {
    headers: {
      cookie: await attachCookies(),
    },
  })

  if (userData) {
    return (
      <main>
        <h1>Welcome back, {userData.data?.email}!</h1>
      </main>
    )
  }

  return (
    <main>
      <h1>Welcome to the Kanban App!</h1>
    </main>
  )
}
