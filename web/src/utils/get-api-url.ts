export function getApiUrl() {
  if (typeof window === 'undefined') {
    return process.env.SSR_API_URL || 'http://localhost:3001'
  } else {
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
  }
}
