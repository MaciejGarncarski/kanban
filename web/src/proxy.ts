export const config = {
  runtime: 'nodejs',
}

import {
  cookieConfigAccessToken,
  cookieConfigRefreshToken,
} from '@/config/cookie.config'
import { checkJWTExpiration } from '@/utils/check-jwt-expire'
import { getCookieValue } from '@/utils/get-cookie-value'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

const signInPath = '/auth/sign-in'

export async function proxy(req: NextRequest) {
  const accessToken = req.cookies.get('accessToken')?.value
  const refreshToken = req.cookies.get('refreshToken')?.value
  const url = req.nextUrl.clone()
  const pathname = url.pathname

  const skipPaths = [
    '/_next',
    '/favicon.ico',
    '/images',
    '/public',
    signInPath,
    '/api',
  ]

  if (skipPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  if (!accessToken && !refreshToken) {
    url.pathname = signInPath
    return NextResponse.redirect(url)
  }

  const isAboutToExpire = accessToken
    ? checkJWTExpiration({ token: accessToken })
    : false

  if (!accessToken || isAboutToExpire) {
    if (!refreshToken) {
      url.pathname = signInPath
      return NextResponse.redirect(url)
    }

    try {
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
        const res = NextResponse.next()

        const refreshTokenCookie = getCookieValue(
          refreshRes.headers.get('set-cookie') || '',
          'refreshToken',
        )
        const newRefreshToken = refreshTokenCookie || ''

        res.cookies.set(
          'refreshToken',
          newRefreshToken,
          cookieConfigRefreshToken,
        )
        res.cookies.set('accessToken', newAccessToken, cookieConfigAccessToken)

        return res
      }

      url.pathname = signInPath
      return NextResponse.redirect(url)
    } catch {
      url.pathname = signInPath
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}
