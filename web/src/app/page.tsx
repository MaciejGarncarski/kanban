import { fetchSSR } from '@/api-client/api-client'
import { ThemeSwitch } from '@/app/theme-switch'
import { Button } from '@mantine/core'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function Home() {
  return (
    <main>
      <Button variant="outline" onClick={signOut}>
        Sign Out
      </Button>
      <ThemeSwitch />
    </main>
  )
}

const signOut = async () => {
  'use server'
  await fetchSSR.DELETE('/auth/logout')

  const cookieStore = await cookies()
  cookieStore.delete('refreshToken')
  cookieStore.delete('accessToken')

  throw redirect('/auth/sign-in')
}
