export function getCookieValue(
  cookieString: string,
  name: string,
): string | null {
  const cookie = cookieString
    .split('; ')
    .find((row) => row.startsWith(name + '='))
  return cookie ? cookie.split('=')[1] || null : null
}
