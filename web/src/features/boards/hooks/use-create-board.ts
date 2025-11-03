import { appQuery } from '@/api-client/api-client'

export function useCreateBoard() {
  return appQuery.useMutation('post', '/v1/boards')
}
