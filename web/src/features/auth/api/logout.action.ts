'use server'

import { fetchServerNoMiddleware } from '@/api-client/api-client'
import {
  cookieConfigAccessToken,
  cookieConfigRefreshToken,
} from '@/config/cookie.config'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export const logout = async () => {
  await fetchServerNoMiddleware.DELETE('/v1/auth/logout')
  const cookieStore = await cookies()

  console.log(cookieStore.getAll())

  cookieStore.delete({
    name: 'refreshToken',
    ...cookieConfigRefreshToken,
  })
  cookieStore.delete({
    name: 'accessToken',
    ...cookieConfigAccessToken,
  })
  console.log('AFTER')
  console.log(cookieStore.getAll())

  redirect('/auth/sign-in')
}
