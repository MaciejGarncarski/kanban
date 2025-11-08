import { appQuery } from '@/api-client/api-client'
import { notifications } from '@mantine/notifications'
import { useRouter } from 'next/navigation'

export function useCreateBoard({ readableTeamId }: { readableTeamId: string }) {
  const router = useRouter()

  return appQuery.useMutation('post', '/v1/boards', {
    onError: (error) => {
      notifications.show({
        title: 'Error',
        message: error.message,
        color: 'red',
        withBorder: true,
        radius: 'lg',
      })
    },
    onSuccess: ({ readableId }) => {
      notifications.show({
        title: 'Success',
        message: 'Board created successfully.',
        color: 'green',
        withBorder: true,
        radius: 'lg',
      })

      router.replace(`/teams/${readableTeamId}/boards/${readableId}`)
    },
  })
}
