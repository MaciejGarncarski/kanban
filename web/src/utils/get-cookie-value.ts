export function getCookieValue(
  setCookieHeader: string,
  cookieName: string,
): string | null {
  if (!setCookieHeader) return null

  const cookies = setCookieHeader.split(/,(?=\s*\w+=)/)

  for (const cookie of cookies) {
    const match = cookie.match(new RegExp(`${cookieName}=([^;]+)`))
    if (match) return match[1] || null
  }

  return null
}
