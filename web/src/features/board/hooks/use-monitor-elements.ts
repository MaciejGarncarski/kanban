import { useEffect } from 'react'
import { extractClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge'
import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { appQuery } from '@/api-client/api-client'

export function useMonitorElements({ boardId }: { boardId: string }) {
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
}
