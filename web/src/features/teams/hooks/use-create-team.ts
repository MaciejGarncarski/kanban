import { appQuery } from '@/api-client/api-client'
import { notifications } from '@mantine/notifications'
import { useRouter } from 'next/navigation'

export function useCreateTeam() {
  const router = useRouter()

  return appQuery.useMutation('post', '/v1/teams', {
    onError: () => {
      notifications.show({
        title: 'Error',
        message: 'Failed to create team. Please try again.',
        color: 'red',
      })
    },
    onSuccess: (newTeam) => {
      notifications.show({
        title: 'Success',
        message: 'Team created successfully.',
        color: 'green',
      })

      router.push(`/teams/${newTeam.readableId}`)
    },
  })
}
