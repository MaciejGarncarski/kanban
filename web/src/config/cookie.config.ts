export const cookieConfigRefreshToken = {
  httpOnly: true,
  path: '/',
  sameSite: 'lax',
  secure: process.env.COOKIE_SECURE === 'true',
  domain: process.env.WEB_DOMAIN || undefined,
  maxAge: 14 * 24 * 60 * 60, // 2 weeks
} as const

export const cookieConfigAccessToken = {
  httpOnly: true,
  path: '/',
  sameSite: 'lax',
  secure: process.env.COOKIE_SECURE === 'true',
  domain: process.env.WEB_DOMAIN || undefined,
  maxAge: 15 * 60, // 15 minutes, JWT is 10 minutes long
} as const

export const cookieConfigCommon = {
  httpOnly: false,
  path: '/',
  sameSite: 'lax',
  secure: process.env.COOKIE_SECURE === 'true',
  domain: process.env.WEB_DOMAIN || undefined,
  maxAge: 365 * 24 * 60 * 60, // 1 year
} as const

export const TEAM_COOKIE_NAME = 'teamId'
