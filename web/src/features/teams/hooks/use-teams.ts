import { appQuery } from '@/api-client/api-client'

export function useTeams() {
  const query = appQuery.useSuspenseQuery('get', '/v1/teams')
  return query
}
