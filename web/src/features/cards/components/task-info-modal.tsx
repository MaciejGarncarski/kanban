import { EditTaskModal } from '@/features/cards/components/edit-task-modal'
import { useDeleteCard } from '@/features/cards/hooks/use-delete-card'
import { useRoleByTeamId } from '@/features/teams/hooks/use-role-by-team-id'
import { useTeamUsers } from '@/features/teams/hooks/use-team-users'
import {
  ActionIcon,
  Button,
  Group,
  Modal,
  Portal,
  Stack,
  Text,
  Title,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { InfoIcon, TrashIcon } from 'lucide-react'

type Props = {
  readableTeamId: string
  cardId: string
  assignedToId?: string
  title: string
  description: string | undefined
  dueDate?: Date | null
}

export function TaskInfoModal({
  readableTeamId,
  cardId,
  assignedToId,
  title,
  description,
  dueDate,
}: Props) {
  const [opened, { open, close }] = useDisclosure(false)
  const { data } = useTeamUsers({ readableTeamId })
  const { isAdmin } = useRoleByTeamId(readableTeamId)
  const assignedToUser = data.users.find((user) => user.id === assignedToId)
  const deleteMutation = useDeleteCard()

  const handleDelete = () => {
    if (!isAdmin) return

    deleteMutation.mutate({
      params: {
        path: { cardId: cardId },
      },
    })
  }

  return (
    <>
      <ActionIcon onClick={open} variant="light" size={'md'}>
        <InfoIcon size={16} />
      </ActionIcon>

      <Portal>
        <Modal
          opened={opened}
          onClose={close}
          title={'Details'}
          centered
          radius={'md'}>
          <Stack gap="sm">
            <Title order={3} size="lg">
              Title: {title}
            </Title>
            <Text maw={'100%'} style={{ wordWrap: 'break-word' }}>
              Description: <span>{description}</span>
            </Text>
            <Stack gap="xs">
              <Group gap="xs">
                <Text>Assigned to:</Text>
                {assignedToUser ? (
                  <Text>
                    {assignedToUser.name} - {assignedToUser.email}
                  </Text>
                ) : (
                  <Text>Unassigned</Text>
                )}
              </Group>
              <Text>
                Due date: {dueDate ? dueDate.toLocaleString() : 'No due date'}
              </Text>
            </Stack>
            {isAdmin && (
              <Group justify="space-between">
                <EditTaskModal
                  readableTeamId={readableTeamId}
                  cardId={cardId}
                  title={title}
                  description={description}
                  dueDate={dueDate}
                  assignedToId={assignedToId}
                />
                <Button
                  mt="md"
                  onClick={handleDelete}
                  loading={deleteMutation.isPending}
                  bg="red"
                  radius={'md'}
                  leftSection={<TrashIcon size={20} />}>
                  Delete
                </Button>
              </Group>
            )}
          </Stack>
        </Modal>
      </Portal>
    </>
  )
}
