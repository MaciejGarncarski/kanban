'use client'

import { AddTaskCardModal } from '@/features/board/components/add-task-card-modal'
import { TaskCard } from '@/features/board/components/task-card'
import { ColumnInfoModal } from '@/features/column/components/column-info-modal'
import {
  draggable,
  dropTargetForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { Card, Group, ScrollAreaAutosize, Stack, Title } from '@mantine/core'
import { useEffect, useRef, useState } from 'react'
import invariant from 'tiny-invariant'
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine'
import {
  attachClosestEdge,
  Edge,
  extractClosestEdge,
} from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge'
import { DropIndicator } from '@/components/drop-indicator'

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
  const columnRef = useRef(null)
  const [isDraggedOver, setIsDraggedOver] = useState(false)

  const cardStackRef = useRef(null)
  useEffect(() => {
    const columnEl = cardStackRef.current
    invariant(columnEl)

    return dropTargetForElements({
      element: columnEl,
      onDragStart: () => setIsDraggedOver(true),
      onDragEnter: () => setIsDraggedOver(true),
      onDragLeave: () => setIsDraggedOver(false),
      onDrop: () => setIsDraggedOver(false),
      getData: () => ({ columnId, type: 'card-stack' }),
      getIsSticky: () => true,
    })
  }, [columnId])

  const [isDragging, setIsDragging] = useState(false)
  const [closestEdge, setClosestEdge] = useState<Edge | null>(null)

  useEffect(() => {
    const columnEl = columnRef.current
    invariant(columnEl)

    return combine(
      draggable({
        element: columnEl,
        getInitialData: () => ({ type: 'column', columnId: columnId }),
        onDragStart: () => setIsDragging(true),
        onDrop: () => setIsDragging(false),
      }),
      dropTargetForElements({
        getIsSticky: () => true,
        element: columnEl,
        getData: ({ input, element }) => {
          const data = { type: 'column', columnId: columnId }
          return attachClosestEdge(data, {
            input,
            element,
            allowedEdges: ['left', 'right'],
          })
        },
        onDrag: (args) => {
          if (args.source.data.columnId !== columnId) {
            setClosestEdge(extractClosestEdge(args.self.data))
          }
        },
        onDragEnter: (args) => {
          if (args.source.data.columnId !== columnId) {
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
  }, [])

  return (
    <Card
      withBorder
      shadow="sm"
      h={'40rem'}
      w="20rem"
      ref={columnRef}
      style={{
        opacity: isDragging ? 0.6 : 1,
        cursor: isDragging ? 'grabbing' : 'grab',
        marginRight: '1rem',
      }}>
      {closestEdge && <DropIndicator edge={closestEdge} />}
      <Group justify="space-between">
        <Title order={2}>{name}</Title>
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
          ref={cardStackRef}
          style={{
            opacity: isDraggedOver ? 0.8 : 1,
            border: isDraggedOver
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
