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
import { useRoleByTeamId } from '@/features/teams/hooks/use-role-by-team-id'
import { teamRoles } from '@/types/team.types'
import { useBoardContext } from '@/features/boards/components/board-context'

export const useColumnDrag = ({
  columnId,
  readableTeamId,
}: {
  columnId: string
  readableTeamId: string
}) => {
  const { role } = useRoleByTeamId(readableTeamId)

  const { setIsDraggingColumn, isDraggingCard } = useBoardContext()

  const columnRef = useRef(null)
  const [closestEdge, setClosestEdge] = useState<Edge | null>(null)

  useEffect(() => {
    const columnEl = columnRef.current
    invariant(columnEl)

    if (role === teamRoles.MEMBER) {
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
  }, [columnId, isDraggingCard, role, setIsDraggingColumn])

  return { columnRef, closestEdge }
}
