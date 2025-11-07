'use client'

import { ColumnInfoModal } from '@/features/columns/components/column-info-modal'
import { Card, Group, ScrollAreaAutosize, Stack, Title } from '@mantine/core'
import { DropIndicator } from '@/components/drop-indicator'
import { useDraggedOver } from '@/hooks/use-dragged-over'
import { TaskCard } from '@/features/cards/components/task-card'
import { AddTaskCardModal } from '@/features/cards/components/add-task-card-modal'
import { useColumnDrag } from '@/features/columns/hooks/use-column-drag'
import { useBoardContext } from '@/features/boards/components/board-context'
import { AnimatePresence, motion } from 'motion/react'

const MotionScrollArea = motion.create(ScrollAreaAutosize)

export const Column = ({
  name,
  columnId,
  createdAt,
  readableTeamId,
  cards,
}: {
  name: string
  columnId: string
  createdAt: string
  readableTeamId: string
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

  const { columnRef, closestEdge } = useColumnDrag({ columnId, readableTeamId })

  return (
    <motion.div
      ref={columnRef}
      layout
      layoutDependency={cards}
      transition={{ type: 'spring', stiffness: 400, damping: 50 }}>
      <Card
        withBorder
        shadow="sm"
        h={'40rem'}
        w="20rem"
        radius={'md'}
        style={{
          opacity: isDraggingColumn ? 0.6 : 1,
          marginRight: '1rem',
        }}>
        {!isDraggingCard && closestEdge && <DropIndicator edge={closestEdge} />}
        <Group justify="space-between" wrap="nowrap">
          <Title
            order={2}
            size="1.5rem"
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
            readableTeamId={readableTeamId}
          />
        </Group>
        <MotionScrollArea layoutScroll scrollbars="y" maw={'20rem'}>
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
              borderRadius: '5px',
              border:
                !isDraggingColumn && isDraggedOver
                  ? '2px dashed #228be6'
                  : '2px solid transparent',
            }}>
            <AnimatePresence mode="popLayout">
              {cards.map(({ id, title, assignedTo, description, dueDate }) => (
                <TaskCard
                  key={id}
                  readableTeamId={readableTeamId}
                  description={description}
                  cardId={id}
                  title={title}
                  assignedToId={assignedTo}
                  dueDate={dueDate ? new Date(dueDate) : null}
                />
              ))}
            </AnimatePresence>
            {isDraggingCard ? null : (
              <AddTaskCardModal
                readableTeamId={readableTeamId}
                columnId={columnId}
              />
            )}
          </Stack>
        </MotionScrollArea>
      </Card>
    </motion.div>
  )
}
