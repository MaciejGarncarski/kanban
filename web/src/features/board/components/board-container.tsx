'use client'

import { Board } from '@/features/board/components/board'
import { BoardProvider } from '@/features/board/components/board-context'
import { useQueryState } from 'nuqs'

export function BoardContainer() {
  const [teamId] = useQueryState('teamId')
  const [boardId] = useQueryState('boardId')

  if (!teamId) {
    return <div>Please select a team to view the board.</div>
  }

  if (!boardId) {
    return <div>Please select a board to view its contents.</div>
  }

  return (
    <BoardProvider>
      <Board boardId={boardId} />
    </BoardProvider>
  )
}
