'use server'

import { fetchServerNoMiddleware } from '@/api-client/api-client'
import { setAuthCookies } from '@/utils/set-auth-cookie'
import { cookies } from 'next/headers'

export const signOut = async () => {
  await fetchServerNoMiddleware.DELETE('/v1/auth/logout')

  const cookieStore = await cookies()
  cookieStore.delete('refreshToken')
  cookieStore.delete('accessToken')
}

export const signIn = async (email: string, password: string) => {
  const { response, data, error } = await fetchServerNoMiddleware.POST(
    '/v1/auth/sign-in',
    {
      body: { email, password },
    },
  )

  if (error) {
    throw new Error(error.correlationId)
  }

  await setAuthCookies({
    refreshToken: response.headers
      .get('set-cookie')
      ?.split(';')[0]
      ?.split('refreshToken=')[1],
    accessToken: data?.accessToken,
  })
}
