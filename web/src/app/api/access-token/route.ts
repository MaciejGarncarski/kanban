import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  const cookieStore = await cookies()
  const accessTokenCookie = cookieStore.get('accessToken')
  const accessToken = accessTokenCookie?.value

  if (!accessToken) {
    return NextResponse.json({ accessToken: null })
  }

  return NextResponse.json({ accessToken })
}
