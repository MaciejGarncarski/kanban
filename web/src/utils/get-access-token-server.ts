import { cookies } from 'next/headers'

export async function getAccessTokenServer() {
  const cookieStore = await cookies()
  const storedAccessToken = cookieStore.get('accessToken')?.value

  return storedAccessToken
}
