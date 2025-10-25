'use server'

import { fetchSSR } from '@/api-client/api-client'
import { setAuthCookies } from '@/utils/set-auth-cookie'
import { cookies } from 'next/headers'

export const signOut = async () => {
  await fetchSSR.DELETE('/v1/auth/logout')

  const cookieStore = await cookies()
  cookieStore.delete('refreshToken')
  cookieStore.delete('accessToken')
}

export const signIn = async (email: string, password: string) => {
  const request = fetchSSR.POST('/v1/auth/sign-in', {
    body: { email, password },
  })

  const { response, data } = await request

  if (!response.ok) {
    throw new Error('Sign in failed', { cause: data })
  }

  await setAuthCookies({
    refreshToken: response.headers
      .get('set-cookie')
      ?.split(';')[0]
      ?.split('refreshToken=')[1],
    accessToken: data?.accessToken,
  })
}
