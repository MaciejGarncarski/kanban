import { appQuery } from '@/api-client/api-client'

export function useAuth() {
  return appQuery.useSuspenseQuery('get', '/v1/auth/me')
}
