import { cookieConfigCommon } from '@/config/cookie.config'

export const setCommonCookie = async ({
  name,
  value,
}: {
  name: string
  value: string
}) => {
  const cookieStore = await import('next/headers').then((mod) => mod.cookies())
  cookieStore.set(name, value, cookieConfigCommon)
}
