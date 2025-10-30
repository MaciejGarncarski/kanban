'use server'

import { fetchServer } from '@/api-client/api-client'
import { deleteAuthCookie } from '@/utils/delete-auth-cookie'
import { redirect } from 'next/navigation'

export const logout = async () => {
  await fetchServer.DELETE('/v1/auth/logout', {
    headers: {
      'x-skip-jwt-middleware': 'true',
    },
  })

  await deleteAuthCookie('refreshToken')
  await deleteAuthCookie('accessToken')

  redirect('/auth/sign-in')
}
