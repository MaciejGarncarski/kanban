'use client'

import { ColumnInfoModal } from '@/features/column/components/column-info-modal'
import { Card, Group, ScrollAreaAutosize, Stack, Title } from '@mantine/core'
import { DropIndicator } from '@/components/drop-indicator'
import { useBoardContext } from '@/features/board/components/board-context'
import { useDraggedOver } from '@/hooks/use-dragged-over'
import { TaskCard } from '@/features/card/components/task-card'
import { AddTaskCardModal } from '@/features/card/components/add-task-card-modal'
import { useColumnDrag } from '@/features/column/hooks/use-column-drag'

export const Column = ({
  name,
  columnId,
  createdAt,
  teamId,
  cards,
  boardId,
}: {
  boardId: string
  name: string
  columnId: string
  createdAt: string
  teamId: string
  cards: Array<{
    id: string
    title: string
    assignedTo?: string
    description?: string
    dueDate?: string
  }>
}) => {
  const { isDraggingColumn, isDraggingCard } = useBoardContext()
  const { isDraggedOver, ref: cardStackRef } = useDraggedOver({
    columnId,
    type: 'card-stack',
  })

  const { columnRef, closestEdge } = useColumnDrag({ columnId, teamId })

  return (
    <Card
      withBorder
      shadow="sm"
      h={'40rem'}
      w="20rem"
      ref={columnRef}
      style={{
        opacity: isDraggingColumn ? 0.6 : 1,
        marginRight: '1rem',
      }}>
      {!isDraggingCard && closestEdge && <DropIndicator edge={closestEdge} />}
      <Group justify="space-between" wrap="nowrap">
        <Title
          order={2}
          maw="80%"
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
          {name}
        </Title>
        <ColumnInfoModal
          columnId={columnId}
          name={name}
          createdAt={createdAt}
          teamId={teamId}
        />
      </Group>
      <ScrollAreaAutosize scrollbars="y" maw={'20rem'}>
        <Stack
          gap="md"
          mt="lg"
          px="4"
          py="xs"
          w="17.5rem"
          mih={'8rem'}
          ref={cardStackRef}
          style={{
            opacity: isDraggedOver ? 0.8 : 1,
            border:
              !isDraggingColumn && isDraggedOver
                ? '2px dashed #228be6'
                : '2px solid transparent',
          }}>
          {cards.map(({ id, title, assignedTo, description, dueDate }) => (
            <TaskCard
              key={id}
              boardId={boardId}
              teamId={teamId}
              description={description}
              cardId={id}
              title={title}
              assignedToId={assignedTo}
              dueDate={dueDate ? new Date(dueDate) : null}
            />
          ))}
          {isDraggedOver ? null : (
            <AddTaskCardModal boardId={boardId} columnId={columnId} />
          )}
        </Stack>
      </ScrollAreaAutosize>
    </Card>
  )
}
