import { appQuery } from '@/api-client/api-client'
import { notifications } from '@mantine/notifications'
import { useRouter } from 'next/navigation'

export function useCreateBoard() {
  const router = useRouter()

  return appQuery.useMutation('post', '/v1/boards', {
    onSuccess: () => {
      notifications.show({
        title: 'Success',
        message: 'Board created successfully.',
        color: 'green',
      })

      router.push(`/`)
    },
  })
}
