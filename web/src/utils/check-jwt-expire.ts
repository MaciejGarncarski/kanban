const THRESHOLD = 100 // seconds

export function checkJWTExpiration({
  token,
  thresholdSeconds = THRESHOLD,
}: {
  token: string
  thresholdSeconds?: number
}): boolean {
  try {
    const [, payload] = token.split('.')

    if (!payload) {
      return true
    }

    const decoded = JSON.parse(atob(payload))
    const exp = decoded.exp
    const now = Math.floor(Date.now() / 1000)

    return exp - now < thresholdSeconds
  } catch {
    return true
  }
}
