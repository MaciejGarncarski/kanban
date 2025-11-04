import { fetchServer } from '@/api-client/api-client'
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
  const isAuthPage = url.pathname.startsWith('/auth')

  if (!refreshToken && !isAuthPage) {
    const isServerAction =
      request.headers.has('next-action') || request.headers.has('x-action')

    if (isServerAction) {
      return NextResponse.next()
    }

    return NextResponse.redirect(new URL('/auth/sign-in', request.url))
  }

  const isAboutToExpire = accessToken
    ? checkJWTExpiration({ token: accessToken })
    : false

  if (!accessToken || isAboutToExpire) {
    try {
      const refreshResponse = await fetchServer.POST('/v1/auth/refresh-token', {
        headers: {
          'x-skip-jwt-middleware': 'true',
          Cookie: `refreshToken=${refreshToken}`,
        },
      })

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

      const newAccessTokenCookie = getCookieValue(
        refreshResponse.response.headers.get('set-cookie') || '',
        'accessToken',
      )

      const newAccessToken =
        newAccessTokenCookie || refreshResponse.data.accessToken
      const res = NextResponse.next()

      // This is workaround for fucking stupid Next.js behavior, that does not allow NOT to encode cookie values
      // So if we have signed cookie from backend, and we would set it in cookie here, it would get encoded, breaking the signature
      // So we manually construct the Set-Cookie header here
      const accessTokenCookie = `${'accessToken'}=${newAccessToken}; Path=${cookieConfigAccessToken.path}; HttpOnly; SameSite=${cookieConfigAccessToken.sameSite}${
        cookieConfigAccessToken.secure ? '; Secure' : ''
      }${cookieConfigAccessToken.domain ? `; Domain=${cookieConfigAccessToken.domain}` : ''}; Max-Age=${cookieConfigAccessToken.maxAge}`

      const refreshCookieString = `${'refreshToken'}=${refreshTokenCookie}; Path=${cookieConfigRefreshToken.path}; HttpOnly; SameSite=${cookieConfigRefreshToken.sameSite}${
        cookieConfigRefreshToken.secure ? '; Secure' : ''
      }${cookieConfigRefreshToken.domain ? `; Domain=${cookieConfigRefreshToken.domain}` : ''}; Max-Age=${cookieConfigRefreshToken.maxAge}`

      res.headers.append('Set-Cookie', accessTokenCookie)
      res.headers.append('Set-Cookie', refreshCookieString)

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
