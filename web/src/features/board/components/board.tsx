'use client'

import { appQuery } from '@/api-client/api-client'
import { MAX_COLUMN_COUNT } from '@/const/column'
import { AddColumnModal } from '@/features/column/components/add-column-modal'
import { Column } from '@/features/column/components/column'
import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import {
  Card,
  Center,
  Flex,
  Group,
  ScrollAreaAutosize,
  Text,
} from '@mantine/core'
import { useEffect, useRef, useState } from 'react'
import { extractClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge'
import invariant from 'tiny-invariant'
import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'

export const Board = ({ boardId }: { boardId: string }) => {
  const { data: boardData } = appQuery.useSuspenseQuery(
    'get',
    '/v1/boards/{boardId}',
    {
      params: { path: { boardId } },
    },
  )

  const columnMutation = appQuery.useMutation(
    'patch',
    '/v1/columns/{columnId}',
    {
      onSuccess: (_, __, ___, ctx) => {
        ctx.client.invalidateQueries({
          queryKey: ['get', '/v1/boards/{boardId}'],
        })
      },
    },
  )

  const cardMutation = appQuery.useMutation('patch', '/v1/cards/{cardId}', {
    onSuccess: (_, __, ___, ctx) => {
      ctx.client.invalidateQueries({
        queryKey: ['get', '/v1/boards/{boardId}'],
      })
    },
  })

  const [isDraggedOver, setIsDraggedOver] = useState(false)
  const boardStack = useRef(null)

  useEffect(() => {
    const boardEl = boardStack.current
    invariant(boardEl)

    return dropTargetForElements({
      element: boardEl,
      onDragStart: () => setIsDraggedOver(true),
      onDragEnter: () => setIsDraggedOver(true),
      onDragLeave: () => setIsDraggedOver(false),
      onDrop: () => setIsDraggedOver(false),
      getIsSticky: () => true,
    })
  }, [])

  useEffect(() => {
    return monitorForElements({
      onDrop: ({ source, location }) => {
        const destination = location.current.dropTargets.length

        if (!destination) {
          return
        }

        if (source.data.type === 'column') {
          const draggedColumnId = source.data.columnId as string

          const [destinationTarget] = location.current.dropTargets.filter(
            (record) => record.data.type === 'column',
          )
          const destinationTargetId = destinationTarget?.data.columnId as string

          const closestEdgeOfTarget = extractClosestEdge({ boardId })

          const indexOfTarget =
            boardData.columns.findIndex(
              (column) => column.id === destinationTargetId,
            ) + 1

          const destinationIndex =
            closestEdgeOfTarget === 'bottom' ? indexOfTarget + 1 : indexOfTarget

          columnMutation.mutate({
            body: {
              position: destinationIndex,
            },
            params: { path: { columnId: draggedColumnId } },
          })
        }

        if (source.data.type === 'card') {
          const draggedCardId = source.data.cardId as string
          const [, sourceColumnRecord] = location.initial.dropTargets
          const sourceColumnId = sourceColumnRecord?.data.columnId
          const sourceColumnData = boardData.columns.find(
            (column) => column.id === sourceColumnId,
          )

          if (!sourceColumnData) {
            return
          }

          const cardTypeDropTargets = location.current.dropTargets.filter(
            (record) => record.data.type === 'card',
          )

          if (cardTypeDropTargets.length === 0) {
            const destinationColumnRecord = location.current.dropTargets.find(
              (record) => record.data.type === 'card-stack',
            )

            const destinationColumnId = destinationColumnRecord?.data
              .columnId as string
            const destinationColumnData = boardData.columns.find(
              (column) => column.id === destinationColumnId,
            )

            if (!destinationColumnData) {
              return
            }

            cardMutation.mutate({
              body: {
                columnId: destinationColumnId,
                position: 1,
              },
              params: {
                path: {
                  cardId: draggedCardId,
                },
              },
            })

            return
          }

          const destinationCardRecord = cardTypeDropTargets[0]
          const destinationColumnRecord = location.current.dropTargets.find(
            (record) => record.data.type === 'card-stack',
          )!

          const destinationColumnId = destinationColumnRecord?.data
            .columnId as string

          if (!destinationCardRecord?.data) {
            return
          }

          const closestEdgeOfTarget = extractClosestEdge(
            destinationCardRecord?.data,
          )
          const destinationColumnData = boardData.columns.find(
            (column) => column.id === destinationColumnId,
          )

          if (!destinationColumnData) {
            return
          }

          const indexOfTarget =
            destinationColumnData.cards.findIndex(
              (card) => card.id === destinationCardRecord?.data.cardId,
            ) + 1

          const destinationIndex =
            closestEdgeOfTarget === 'bottom' ? indexOfTarget + 1 : indexOfTarget

          cardMutation.mutate({
            body: {
              columnId: destinationColumnId,
              position: destinationIndex,
            },
            params: {
              path: {
                cardId: draggedCardId,
              },
            },
          })
        }
      },
    })
  }, [cardMutation, boardData.columns, boardId, columnMutation])

  return (
    <Flex direction="column" gap="md">
      <Text>
        {boardData?.description || 'No description provided for this board.'}
      </Text>

      <ScrollAreaAutosize scrollbars="x" offsetScrollbars>
        <Group justify="flex-start" wrap="nowrap" gap="lg" ref={boardStack}>
          {boardData?.columns.map(
            ({ name, cards, id: columnId, createdAt }) => {
              return (
                <Column
                  key={columnId}
                  boardId={boardId}
                  name={name}
                  columnId={columnId}
                  createdAt={createdAt}
                  teamId={boardData.teamId}
                  cards={cards}
                />
              )
            },
          )}

          {MAX_COLUMN_COUNT > (boardData?.columns.length || 0) &&
            !isDraggedOver && (
              <Card
                withBorder
                shadow="sm"
                h={'40rem'}
                w="20rem"
                style={{ flexShrink: 0, justifyContent: 'center' }}>
                <Center>
                  <AddColumnModal boardId={boardId} />
                </Center>
              </Card>
            )}
        </Group>
      </ScrollAreaAutosize>
    </Flex>
  )
}
