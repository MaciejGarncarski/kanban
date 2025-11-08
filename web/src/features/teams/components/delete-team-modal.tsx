'use client'

import { useDeleteTeam } from '@/features/teams/hooks/use-delete-team'
import { useTeams } from '@/features/teams/hooks/use-teams'
import { Button, Group, Modal } from '@mantine/core'
import { useRouter } from 'next/navigation'

type Props = {
  isOpen: boolean
  onClose: () => void
  readableTeamId: string
}

export function DeleteTeamModal({ isOpen, onClose, readableTeamId }: Props) {
  const router = useRouter()
  const { data: teamsData } = useTeams()
  const { mutate, isPending } = useDeleteTeam()

  if (!teamsData) {
    return null
  }

  const currentTeam = teamsData.teams.find(
    (team) => team.readableId === readableTeamId,
  )

  const handleDelete = () => {
    mutate(
      { params: { path: { readableTeamId: readableTeamId } } },
      {
        onSuccess: () => {
          onClose()
          router.push('/')
        },
      },
    )
  }

  return (
    <Modal
      centered
      opened={isOpen}
      onClose={onClose}
      title="Delete Team"
      radius={'md'}>
      <div>
        <p>
          Are you sure you want to delete team &quot;{currentTeam?.name}&quot;?
        </p>
      </div>
      <Group mt="xl" justify="space-between">
        <Button color="red" loading={isPending} onClick={handleDelete}>
          Delete
        </Button>
        <Button onClick={onClose}>Cancel</Button>
      </Group>
    </Modal>
  )
}
