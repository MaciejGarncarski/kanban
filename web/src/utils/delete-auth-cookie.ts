import {
  cookieConfigAccessToken,
  cookieConfigRefreshToken,
} from '@/config/cookie.config'
import { cookies } from 'next/headers'

export async function deleteAuthCookie(type: 'accessToken' | 'refreshToken') {
  const cookieStore = await cookies()

  if (type === 'accessToken') {
    cookieStore.delete({
      name: 'accessToken',
      ...cookieConfigAccessToken,
    })
  }

  if (type === 'refreshToken') {
    cookieStore.delete({
      name: 'refreshToken',
      ...cookieConfigRefreshToken,
    })
  }
}
