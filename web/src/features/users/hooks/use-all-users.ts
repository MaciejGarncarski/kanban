import { appQuery } from '@/api-client/api-client'

export function useAllUsers() {
  return appQuery.useSuspenseQuery('get', '/v1/user/all')
}
