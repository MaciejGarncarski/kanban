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
import { useEffect, useRef, useState } from 'react'
import invariant from 'tiny-invariant'
import {
  draggable,
  dropTargetForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine'
import {
  attachClosestEdge,
  Edge,
  extractClosestEdge,
} from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge'
import { DropIndicator } from '@/components/drop-indicator'
import { useBoardContext } from '@/features/board/components/board-context'

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
  const { setIsDraggingCard, isDraggingCard, isDraggingColumn } =
    useBoardContext()
  const cardRef = useRef(null)
  const [closestEdge, setClosestEdge] = useState<Edge | null>(null)
  useEffect(() => {
    const cardEl = cardRef.current
    invariant(cardEl)

    return combine(
      draggable({
        element: cardEl,
        getInitialData: () => ({ type: 'card', cardId: cardId }),
        onDragStart: () => {
          if (!isDraggingColumn) {
            setIsDraggingCard(true)
          }
        },
        onDrop: () => setIsDraggingCard(false),
      }),
      dropTargetForElements({
        getIsSticky: () => true,
        element: cardEl,
        getData: ({ input, element }) => {
          const data = { type: 'card', cardId: cardId }
          return attachClosestEdge(data, {
            input,
            element,
            allowedEdges: ['top', 'bottom'],
          })
        },
        onDrag: (args) => {
          if (args.source.data.cardId !== cardId) {
            setClosestEdge(extractClosestEdge(args.self.data))
          }
        },
        onDragEnter: (args) => {
          if (args.source.data.cardId !== cardId) {
            setClosestEdge(extractClosestEdge(args.self.data))
          }
        },
        onDragLeave: () => {
          setClosestEdge(null)
        },
        onDrop: () => {
          setClosestEdge(null)
        },
      }),
    )
  }, [cardId, isDraggingColumn, setIsDraggingCard])

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
            queryKey: ['get', '/v1/boards/{boardId}'],
          })
        },
      },
    )
  }

  return (
    <Paper
      withBorder
      py="sm"
      px="md"
      style={{
        opacity: isDraggingCard ? 0.6 : 1,
        maxWidth: '100%',
        position: 'relative',
      }}
      ref={cardRef}>
      {!isDraggingColumn && closestEdge && <DropIndicator edge={closestEdge} />}
      <Stack w="100%" gap="xs">
        <Flex w="100%" justify="space-between" align="center">
          <Text>{title}</Text>
          <ActionIcon onClick={open} variant="subtle" size={'md'}>
            <Info size={'70%'} />
          </ActionIcon>
        </Flex>
        <Group gap="xs" justify="space-between" align="center" wrap="nowrap">
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
        </Group>
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
