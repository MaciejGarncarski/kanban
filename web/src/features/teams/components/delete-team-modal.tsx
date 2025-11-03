'use client'

import { appQuery } from '@/api-client/api-client'
import { Button, Group, Modal } from '@mantine/core'

type Props = {
  isOpen: boolean
  onClose: () => void
  teamId: string
}

export function DeleteTeamModal({ isOpen, onClose, teamId }: Props) {
  const { data: allTeams } = appQuery.useSuspenseQuery('get', '/v1/teams')

  if (!allTeams) {
    return null
  }

  const currentTeam = allTeams.teams.find((team) => team.readableId === teamId)

  return (
    <Modal centered opened={isOpen} onClose={onClose} title="Delete Team">
      <div>
        <p>
          Are you sure you want to delete team &quot;{currentTeam?.name}&quot;?
        </p>
      </div>
      <Group mt="xl" justify="space-between">
        <Button color="red">Delete</Button>
        <Button onClick={onClose}>Cancel</Button>
      </Group>
    </Modal>
  )
}
