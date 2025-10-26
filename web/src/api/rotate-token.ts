'use server'

import { fetchServerNoMiddleware } from '@/api-client/api-client'
import { getCookieValue } from '@/utils/get-cookie-value'
import { setAuthCookies } from '@/utils/set-auth-cookie'
import { cookies } from 'next/headers'

export async function rotateToken() {
  const cookieStore = await cookies()
  const refreshToken = cookieStore.get('refreshToken')?.value

  const refreshResponse = await fetchServerNoMiddleware.POST(
    '/v1/auth/refresh-token',
    {
      headers: {
        Cookie: `refreshToken=${refreshToken}`,
      },
    },
  )

  if (refreshResponse.data) {
    const { accessToken: newAccessToken } = refreshResponse.data

    const refreshTokenCookie = getCookieValue(
      refreshResponse.response.headers.get('set-cookie') || '',
      'refreshToken',
    )
    const newRefreshToken = refreshTokenCookie || ''

    await setAuthCookies({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    })

    return { accessToken: newAccessToken }
  }

  return { accessToken: null }
}
