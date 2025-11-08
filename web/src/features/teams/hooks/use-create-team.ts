import { appQuery } from '@/api-client/api-client'
import { notifications } from '@mantine/notifications'
import { useRouter } from 'next/navigation'

export function useCreateTeam() {
  const router = useRouter()

  return appQuery.useMutation('post', '/v1/teams', {
    onError: (err) => {
      notifications.show({
        title: 'Error',
        message: err.message,
        color: 'red',
        withBorder: true,
        radius: 'lg',
      })
    },
    onSuccess: (newTeam) => {
      notifications.show({
        title: 'Success',
        message: 'Team created successfully.',
        color: 'green',
        withBorder: true,
        radius: 'lg',
      })

      router.push(`/teams/${newTeam.readableId}`)
    },
  })
}
