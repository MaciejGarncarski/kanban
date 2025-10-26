'use server'

import { fetchServerNoMiddleware } from '@/api-client/api-client'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export const logout = async () => {
  await fetchServerNoMiddleware.DELETE('/v1/auth/logout')
  const cookieStore = await cookies()

  cookieStore.delete('refreshToken')
  cookieStore.delete('accessToken')

  redirect('/auth/sign-in')
}
