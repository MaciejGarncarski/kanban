'use server'

import { fetchServerNoMiddleware } from '@/api-client/api-client'
import { cookies } from 'next/headers'

export async function checkIsAuthed() {
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('accessToken')?.value || ''
    const refreshToken = cookieStore.get('refreshToken')?.value || ''

    const res = await fetchServerNoMiddleware.GET('/v1/auth/me', {
      headers: {
        Cookie: `accessToken=${accessToken}; refreshToken=${refreshToken};`,
      },
    })

    if (res.data?.id) {
      return true
    }

    return false
  } catch {
    return false
  }
}
