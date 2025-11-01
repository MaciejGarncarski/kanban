import { appQuery } from '@/api-client/api-client'
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
import { EditIcon, Info, TrashIcon } from 'lucide-react'

type Props = {
  teamId: string
  cardId: string
  boardId: string
  assignedToId?: string
  title: string
  description: string | undefined
  dueDate?: Date | null
}

export function TaskInfoModal({
  teamId,
  cardId,
  boardId,
  assignedToId,
  title,
  description,
  dueDate,
}: Props) {
  const [opened, { open, close }] = useDisclosure(false)
  const { data } = appQuery.useSuspenseQuery(
    'get',
    '/v1/boards/{boardId}/users',
    {
      params: {
        path: {
          boardId,
        },
      },
    },
  )

  const { data: roleData } = appQuery.useSuspenseQuery(
    'get',
    '/v1/user/{teamId}/role',
    {
      params: { path: { teamId } },
    },
  )
  const assignedToUser = data.users.find((user) => user.id === assignedToId)
  const isAdmin = roleData.role === 'admin'
  const deleteMutation = appQuery.useMutation('delete', '/v1/cards/{cardId}')

  const handleDelete = () => {
    if (!isAdmin) return

    deleteMutation.mutate(
      {
        params: {
          path: { cardId: cardId },
        },
      },
      {
        onSuccess: (_, __, ___, context) => {
          context.client.invalidateQueries({
            queryKey: ['get', '/v1/boards/{boardId}'],
          })
        },
      },
    )
  }

  return (
    <>
      <ActionIcon onClick={open} variant="subtle" size={'md'}>
        <Info size={'70%'} />
      </ActionIcon>

      <Portal>
        <Modal opened={opened} onClose={close} title={'Details'} centered>
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
                <Button
                  mt="md"
                  onClick={close}
                  leftSection={<EditIcon size={20} />}>
                  Edit
                </Button>
                <Button
                  mt="md"
                  onClick={handleDelete}
                  loading={deleteMutation.isPending}
                  bg="red"
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
