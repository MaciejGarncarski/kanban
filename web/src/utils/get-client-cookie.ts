export function getClientCookie<T>(name: string): T | null {
  if (typeof document === 'undefined') {
    return null
  }

  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))

  if (match) {
    return match[2] as T
  }

  return null
}
