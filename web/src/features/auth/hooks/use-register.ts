import { appQuery } from '@/api-client/api-client'

export function useRegister() {
  return appQuery.useMutation('post', '/v1/auth/register', {})
}
