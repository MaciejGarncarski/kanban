'use server'

import { fetchServerNoMiddleware } from '@/api-client/api-client'
import { deleteAuthCookie } from '@/utils/delete-auth-cookie'
import { redirect } from 'next/navigation'

export const logout = async () => {
  await fetchServerNoMiddleware.DELETE('/v1/auth/logout')

  await deleteAuthCookie('refreshToken')
  await deleteAuthCookie('accessToken')

  redirect('/auth/sign-in')
}
