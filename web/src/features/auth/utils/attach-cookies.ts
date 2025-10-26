import { cookies } from 'next/headers'

export async function attachCookies() {
  const cookieStore = await cookies()
  return cookieStore.toString()
}
