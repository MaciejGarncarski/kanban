'use server'

import { getApiUrl } from '@/utils/get-api-url'
import { getCookieValue } from '@/utils/get-cookie-value'
import { setAuthCookies } from '@/utils/set-auth-cookie'
import { cookies } from 'next/headers'

export async function rotateToken() {
  const cookieStore = await cookies()
  const refreshToken = cookieStore.get('refreshToken')?.value
  const BACKEND_URL = getApiUrl()

  const refreshRes = await fetch(`${BACKEND_URL}/auth/refresh-token`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Cookie: `refreshToken=${refreshToken}`,
    },
  })

  if (refreshRes.ok) {
    const { accessToken: newAccessToken } = await refreshRes.json()

    const refreshTokenCookie = getCookieValue(
      refreshRes.headers.get('set-cookie') || '',
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
