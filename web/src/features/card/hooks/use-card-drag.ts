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

export const useCardDrag = ({ cardId }: { cardId: string }) => {
  const { setIsDraggingCard, isDraggingColumn, isDraggingCard } =
    useBoardContext()

  const cardRef = useRef(null)
  const [closestEdge, setClosestEdge] = useState<Edge | null>(null)

  useEffect(() => {
    const cardEl = cardRef.current
    invariant(cardEl)

    return combine(
      draggable({
        element: cardEl,
        getInitialData: () => ({ type: 'card', cardId: cardId }),
        onDragStart: () => {
          if (!isDraggingColumn) {
            setIsDraggingCard(true)
          }
        },
        onDrop: () => setIsDraggingCard(false),
      }),
      dropTargetForElements({
        getIsSticky: () => true,
        element: cardEl,
        getData: ({ input, element }) => {
          const data = { type: 'card', cardId: cardId }
          return attachClosestEdge(data, {
            input,
            element,
            allowedEdges: ['top', 'bottom'],
          })
        },
        onDrag: (args) => {
          if (args.source.data.cardId !== cardId) {
            setClosestEdge(extractClosestEdge(args.self.data))
          }
        },
        onDragEnter: (args) => {
          if (args.source.data.cardId !== cardId) {
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
  }, [cardId, isDraggingCard, isDraggingColumn, setIsDraggingCard])

  return { cardRef, closestEdge }
}
