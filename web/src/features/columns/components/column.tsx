'use client'

import { ColumnInfoModal } from '@/features/columns/components/column-info-modal'
import { Card, Flex, Group, ScrollAreaAutosize, Title } from '@mantine/core'
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
  const { isDraggedOver, ref: cardStackRef } = useDraggedOver(
    {
      columnId,
      type: 'card-stack',
    },
    'vertical',
  )

  const { columnRef, closestEdge } = useColumnDrag({
    columnId,
    readableTeamId,
  })

  return (
    <motion.div
      ref={columnRef}
      layout
      layoutId={columnId}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      style={{ flexShrink: 0, flexGrow: 0, width: '20rem' }}
      transition={{ type: 'spring', stiffness: 400, damping: 50 }}
      initial={false}>
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
        <Group justify="space-between" wrap="nowrap" pb="sm">
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
        <AnimatePresence mode="popLayout" initial={false}>
          <MotionScrollArea
            layoutScroll
            layout
            layoutId={columnId + '-scrollarea'}
            scrollbars="y"
            h={'34rem'}
            viewportRef={cardStackRef}>
            <Flex
              py="sm"
              px="xs"
              direction="column"
              mih={'20rem'}
              wrap="nowrap"
              gap="md"
              ref={cardStackRef}
              style={{
                transition:
                  'border 150ms, background-color 150ms, opacity 150ms',
                opacity: isDraggedOver ? 0.8 : 1,
                borderRadius: '5px',
                border:
                  !isDraggingColumn && isDraggedOver
                    ? '1px dashed #228be6'
                    : '1px dashed transparent',
              }}>
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
              {isDraggingCard ? null : (
                <AddTaskCardModal
                  readableTeamId={readableTeamId}
                  columnId={columnId}
                />
              )}
            </Flex>
          </MotionScrollArea>
        </AnimatePresence>
      </Card>
    </motion.div>
  )
}
