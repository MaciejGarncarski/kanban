import { useEffect } from 'react'
import { extractClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge'
import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { useBoardById } from '@/features/boards/hooks/use-board-by-id'
import { useUpdateCard } from '@/features/cards/hooks/use-update-card'
import { useUpdateColumn } from '@/features/columns/hooks/use-update-column'

export function useMonitorElements({
  readableBoardId,
}: {
  readableBoardId: string
}) {
  const { data: boardData } = useBoardById({ readableBoardId })
  const cardMutation = useUpdateCard()
  const columnMutation = useUpdateColumn()

  useEffect(() => {
    if (!boardData) {
      return
    }

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

          if (!destinationTarget?.data) {
            return
          }

          const closestEdgeOfTarget = extractClosestEdge(
            destinationTarget?.data,
          )

          const indexOfTarget =
            boardData.columns.findIndex(
              (column) => column.id === destinationTargetId,
            ) + 1

          // its ok
          const destinationIndex =
            closestEdgeOfTarget === 'right' ? indexOfTarget + 1 : indexOfTarget

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
  }, [cardMutation, boardData, readableBoardId, columnMutation])
}
