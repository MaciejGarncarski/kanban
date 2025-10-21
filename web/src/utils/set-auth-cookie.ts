import {
  cookieConfigAccessToken,
  cookieConfigRefreshToken,
} from '@/config/cookie.config'

export const setAuthCookies = async ({
  accessToken,
  refreshToken,
}: {
  accessToken?: string
  refreshToken?: string
}) => {
  const cookieStore = await import('next/headers').then((mod) => mod.cookies())

  if (refreshToken) {
    cookieStore.set('refreshToken', refreshToken, cookieConfigRefreshToken)
  }
  if (accessToken) {
    cookieStore.set('accessToken', accessToken, cookieConfigAccessToken)
  }
}
