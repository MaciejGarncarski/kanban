import { fetchProxy } from '@/api-client/api-client'
import {
  cookieConfigAccessToken,
  cookieConfigRefreshToken,
} from '@/config/cookie.config'
import { checkJWTExpiration } from '@/utils/check-jwt-expire'
import { getCookieValue } from '@/utils/get-cookie-value'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const skipPaths = [
  '/_next',
  '/favicon.ico',
  '/images',
  '/public',
  '/api',
  '/static',
]

const skipAuthPaths = ['/auth/sign-in', '/auth/register']

export async function proxy(req: NextRequest) {
  const accessToken = req.cookies.get('accessToken')?.value
  const refreshToken = req.cookies.get('refreshToken')?.value
  const url = req.nextUrl

  if (url.pathname.startsWith('/.')) {
    return NextResponse.next()
  }

  if (skipPaths.some((path) => url.pathname.startsWith(path))) {
    return NextResponse.next()
  }

  const isAuthRoute = skipAuthPaths.some((path) =>
    url.pathname.startsWith(path),
  )

  if (isAuthRoute && !refreshToken) {
    return NextResponse.next()
  }

  if (isAuthRoute && !accessToken) {
    return NextResponse.next()
  }

  if (isAuthRoute) {
    const meResponse = await fetchProxy.GET('/v1/auth/me', {
      headers: {
        Cookie: `accessToken=${accessToken};`,
      },
    })

    if (meResponse.error) {
      return NextResponse.next()
    }

    return NextResponse.redirect(new URL('/', url))
  }

  if (!refreshToken) {
    return NextResponse.redirect(new URL('/auth/sign-in', url))
  }

  const isAboutToExpire = accessToken
    ? checkJWTExpiration({ token: accessToken })
    : false

  let shouldRedirect = false

  if (!accessToken || isAboutToExpire) {
    try {
      const refreshResponse = await fetchProxy.POST('/v1/auth/refresh-token', {
        headers: {
          Cookie: `refreshToken=${refreshToken}`,
        },
      })

      if (refreshResponse.error) {
        return NextResponse.redirect(new URL('/auth/sign-in', url))
      }

      const refreshTokenCookie = getCookieValue(
        refreshResponse.response.headers.get('set-cookie') || '',
        'refreshToken',
      )
      const newRefreshToken = refreshTokenCookie || ''

      const newAccessToken = refreshResponse.data.accessToken
      const res = NextResponse.next()
      res.cookies.set('refreshToken', newRefreshToken, cookieConfigRefreshToken)
      res.cookies.set('accessToken', newAccessToken, cookieConfigAccessToken)

      return res
    } catch {
      shouldRedirect = true
    }
  }

  if (shouldRedirect) {
    return NextResponse.redirect(new URL('/auth/sign-in', url))
  }

  return NextResponse.next()
}
