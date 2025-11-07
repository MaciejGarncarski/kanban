'use client'

import { Flex, Group, Paper, Stack, Text } from '@mantine/core'
import { DropIndicator } from '@/components/drop-indicator'
import { useCardDrag } from '@/features/cards/hooks/use-card-drag'
import { TaskInfoModal } from '@/features/cards/components/task-info-modal'
import { useBoardContext } from '@/features/boards/components/board-context'
import { MouseEvent } from 'react'
import { motion } from 'motion/react'

type Props = {
  title: string
  description?: string
  assignedToId?: string
  dueDate?: Date | null
  readableTeamId: string
  cardId: string
}

export function TaskCard({
  title,
  description,
  assignedToId,
  dueDate,
  readableTeamId,
  cardId,
}: Props) {
  const { isDraggingCard, isDraggingColumn } = useBoardContext()
  const { cardRef, closestEdge } = useCardDrag({ cardId })

  const preventContextMenu = (event: MouseEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  return (
    <motion.div
      layout
      layoutId={cardId}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}>
      <Paper
        withBorder
        py="sm"
        px="md"
        radius="md"
        onContextMenu={preventContextMenu}
        style={{
          opacity: isDraggingCard ? 0.6 : 1,
          maxWidth: '100%',
          position: 'relative',
        }}
        ref={cardRef}>
        {!isDraggingColumn && closestEdge && (
          <DropIndicator edge={closestEdge} />
        )}
        <Stack w="100%" gap="xs" mih={'3.5rem'}>
          <Flex w="100%" justify="space-between" align="center">
            <Text>{title}</Text>
            <TaskInfoModal
              readableTeamId={readableTeamId}
              cardId={cardId}
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
            ) : null}
          </Group>
        </Stack>
      </Paper>
    </motion.div>
  )
}
