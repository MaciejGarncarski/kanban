'use client'

import { appQuery } from '@/api-client/api-client'
import { Button, Group, Modal } from '@mantine/core'
import { useRouter } from 'next/navigation'

type Props = {
  isOpen: boolean
  onClose: () => void
  teamId: string
}

export function DeleteTeamModal({ isOpen, onClose, teamId }: Props) {
  const { data: allTeams } = appQuery.useSuspenseQuery('get', '/v1/teams')
  const router = useRouter()

  if (!allTeams) {
    return null
  }

  const currentTeam = allTeams.teams.find((team) => team.readableId === teamId)

  const { mutate, isPending } = appQuery.useMutation(
    'delete',
    `/v1/teams/{teamId}`,
    {
      onSuccess: (_, __, ___, { client }) => {
        onClose()
        client.invalidateQueries({ queryKey: ['get', '/v1/teams'] })
        router.push('/')
      },
    },
  )

  return (
    <Modal centered opened={isOpen} onClose={onClose} title="Delete Team">
      <div>
        <p>
          Are you sure you want to delete team &quot;{currentTeam?.name}&quot;?
        </p>
      </div>
      <Group mt="xl" justify="space-between">
        <Button
          color="red"
          loading={isPending}
          onClick={() => mutate({ params: { path: { teamId } } })}>
          Delete
        </Button>
        <Button onClick={onClose}>Cancel</Button>
      </Group>
    </Modal>
  )
}
