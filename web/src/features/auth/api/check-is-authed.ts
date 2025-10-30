'use server'

import { fetchServer } from '@/api-client/api-client'
import { cookies } from 'next/headers'

export async function checkIsAuthed() {
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('accessToken')?.value || ''
    const refreshToken = cookieStore.get('refreshToken')?.value || ''

    const res = await fetchServer.GET('/v1/auth/me', {
      headers: {
        'x-skip-jwt-middleware': 'true',
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
