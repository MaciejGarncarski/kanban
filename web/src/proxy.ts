import { fetchServerNoMiddleware } from '@/api-client/api-client'
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
  '/auth/sign-in',
  '/auth/register',
]

export async function proxy(request: NextRequest) {
  const url = request.nextUrl

  if (url.pathname.startsWith('/.')) {
    return NextResponse.next()
  }

  if (skipPaths.some((path) => url.pathname.startsWith(path))) {
    return NextResponse.next()
  }

  const accessToken = request.cookies.get('accessToken')?.value
  const refreshToken = request.cookies.get('refreshToken')?.value

  if (!refreshToken) {
    const isServerAction =
      request.headers.has('next-action') || request.headers.has('x-action')

    if (isServerAction) {
      return NextResponse.next()
    }

    return NextResponse.redirect(new URL('/auth/sign-in', request.url), {
      status: 302,
    })
  }

  const isAboutToExpire = accessToken
    ? checkJWTExpiration({ token: accessToken })
    : false

  if (!accessToken || isAboutToExpire) {
    try {
      const refreshResponse = await fetchServerNoMiddleware.POST(
        '/v1/auth/refresh-token',
        {
          headers: {
            Cookie: `refreshToken=${refreshToken}`,
          },
        },
      )

      const status = refreshResponse.response?.status ?? 0

      if (status < 200 || status >= 300 || !refreshResponse.data) {
        const redirectRes = NextResponse.redirect(
          new URL('/auth/sign-in', request.url),
          {
            status: 302,
          },
        )
        redirectRes.cookies.delete('accessToken')
        redirectRes.cookies.delete('refreshToken')

        return redirectRes
      }

      const refreshTokenCookie = getCookieValue(
        refreshResponse.response.headers.get('set-cookie') || '',
        'refreshToken',
      )

      if (!refreshTokenCookie) {
        const redirectRes = NextResponse.redirect(
          new URL('/auth/sign-in', request.url),
          {
            status: 302,
          },
        )

        redirectRes.cookies.delete('accessToken')
        redirectRes.cookies.delete('refreshToken')

        return redirectRes
      }

      const newAccessToken = refreshResponse.data.accessToken
      const res = NextResponse.next()

      res.cookies.set(
        'refreshToken',
        refreshTokenCookie,
        cookieConfigRefreshToken,
      )
      res.cookies.set('accessToken', newAccessToken, cookieConfigAccessToken)

      return res
    } catch {
      const redirectRes = NextResponse.redirect(
        new URL('/auth/sign-in', request.url),
        {
          status: 302,
        },
      )

      redirectRes.cookies.delete('accessToken')
      redirectRes.cookies.delete('refreshToken')

      return redirectRes
    }
  }

  return NextResponse.next()
}
