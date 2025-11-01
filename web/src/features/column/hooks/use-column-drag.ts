import { useBoardContext } from '@/features/board/components/board-context'
import { useEffect, useRef, useState } from 'react'
import {
  attachClosestEdge,
  Edge,
  extractClosestEdge,
} from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge'
import invariant from 'tiny-invariant'
import {
  draggable,
  dropTargetForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine'
import { appQuery } from '@/api-client/api-client'

export const useColumnDrag = ({
  columnId,
  teamId,
}: {
  columnId: string
  teamId: string
}) => {
  const { data: roleData } = appQuery.useSuspenseQuery(
    'get',
    '/v1/user/{teamId}/role',
    {
      params: { path: { teamId } },
    },
  )

  const { setIsDraggingColumn, isDraggingCard } = useBoardContext()

  const columnRef = useRef(null)
  const [closestEdge, setClosestEdge] = useState<Edge | null>(null)

  useEffect(() => {
    const columnEl = columnRef.current
    invariant(columnEl)

    if (roleData.role === 'member') {
      return
    }

    return combine(
      draggable({
        element: columnEl,
        getInitialData: () => ({ type: 'column', columnId: columnId }),
        onDragStart: () => {
          if (!isDraggingCard) {
            setIsDraggingColumn(true)
          }
        },
        onDrop: () => setIsDraggingColumn(false),
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
  }, [columnId, isDraggingCard, roleData.role, setIsDraggingColumn])

  return { columnRef, closestEdge }
}
