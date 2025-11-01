'use client'

import { Flex, Group, Paper, Stack, Text } from '@mantine/core'
import { DropIndicator } from '@/components/drop-indicator'
import { useBoardContext } from '@/features/board/components/board-context'
import { useCardDrag } from '@/features/card/hooks/use-card-drag'
import { TaskInfoModal } from '@/features/card/components/task-info-modal'

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
  const { isDraggingCard, isDraggingColumn } = useBoardContext()
  const { cardRef, closestEdge } = useCardDrag({ cardId })

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
          <TaskInfoModal
            teamId={teamId}
            cardId={cardId}
            boardId={boardId}
            assignedToId={assignedToId}
            title={title}
            dueDate={dueDate}
            description={description}
          />
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
    </Paper>
  )
}
