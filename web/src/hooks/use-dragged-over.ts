import { useEffect, useRef, useState } from 'react'
import invariant from 'tiny-invariant'
import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine'
import { autoScrollForElements } from '@atlaskit/pragmatic-drag-and-drop-auto-scroll/element'

type Data = Record<string, unknown>

export function useDraggedOver(data: Data) {
  const [isDraggedOver, setIsDraggedOver] = useState(false)

  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = ref.current
    invariant(el)

    return combine(
      dropTargetForElements({
        element: el,
        onDragStart: () => setIsDraggedOver(true),
        onDragEnter: () => setIsDraggedOver(true),
        onDragLeave: () => setIsDraggedOver(false),
        onDrop: () => setIsDraggedOver(false),
        getData: () => data,
        getIsSticky: () => true,
      }),
      autoScrollForElements({
        element: el,
        getAllowedAxis: () => 'vertical',
      }),
    )
  }, [data])

  return { isDraggedOver, ref }
}
