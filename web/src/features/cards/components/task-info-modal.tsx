import { EditTaskModal } from '@/features/cards/components/edit-task-modal'
import { useDeleteCard } from '@/features/cards/hooks/use-delete-card'
import { useRoleByTeamId } from '@/features/teams/hooks/use-role-by-team-id'
import { useTeamUsers } from '@/features/teams/hooks/use-team-users'
import {
  ActionIcon,
  Button,
  Group,
  Modal,
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
  const [deleteOpened, { open: openDelete, close: closeDelete }] =
    useDisclosure(false)

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
      <Modal
        withinPortal
        opened={deleteOpened}
        onClose={closeDelete}
        title="Delete Task Card"
        centered
        radius={'md'}>
        <Text>
          Are you sure you want to delete the task card? This action cannot be
          undone.
        </Text>
        <div>
          <Button
            mt="md"
            ml="auto"
            color="red"
            radius={'md'}
            onClick={handleDelete}
            loading={deleteMutation.isPending}
            leftSection={<TrashIcon size={20} />}>
            Delete
          </Button>
        </div>
      </Modal>

      <ActionIcon onClick={open} variant="light" size={'md'}>
        <InfoIcon size={16} />
      </ActionIcon>

      {deleteOpened ? null : (
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
                  onClick={openDelete}
                  bg="red"
                  radius={'md'}
                  leftSection={<TrashIcon size={20} />}>
                  Delete
                </Button>
              </Group>
            )}
          </Stack>
        </Modal>
      )}
    </>
  )
}
