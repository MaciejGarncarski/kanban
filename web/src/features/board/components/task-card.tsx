'use client'

import { appQuery } from '@/api-client/api-client'
import {
  ActionIcon,
  Button,
  Flex,
  Group,
  Modal,
  Paper,
  Stack,
  Text,
  Title,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { EditIcon, Info, TrashIcon } from 'lucide-react'

type Props = {
  title: string
  description?: string
  assignedToId?: string
  dueDate?: Date | null
  boardId: string
  teamId: string
  cardId: string
}

export function TaskCard({
  title,
  description,
  assignedToId,
  dueDate,
  boardId,
  teamId,
  cardId,
}: Props) {
  const [opened, { open, close }] = useDisclosure(false)

  const { data } = appQuery.useSuspenseQuery(
    'get',
    '/user/v1/boards/{boardId}/users',
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
    '/user/v1/users/{teamId}/role',
    {
      params: { path: { teamId } },
    },
  )

  const deleteMutation = appQuery.useMutation('delete', '/v1/cards/{cardId}')

  const isAdmin = roleData.role === 'admin'
  const assignedToUser = data.users.find((user) => user.id === assignedToId)

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
            queryKey: ['get', '/v1/boards/{id}'],
          })
        },
      },
    )
  }

  return (
    <Paper withBorder py="sm" px="md" style={{ maxWidth: '100%' }}>
      <Stack w="100%" gap="1">
        <Flex w="100%" justify="space-between" align="center">
          <Text>{title}</Text>
          <ActionIcon onClick={open} variant="subtle" size={'md'}>
            <Info size={'70%'} />
          </ActionIcon>
        </Flex>
        {description ? (
          <Text
            c="gray.6"
            style={{
              maxWidth: '100%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
            {description}
          </Text>
        ) : (
          <Text c="gray.6">No description provided.</Text>
        )}
      </Stack>

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
    </Paper>
  )
}
