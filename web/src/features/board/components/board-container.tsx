'use client'

import { Board } from '@/features/board/components/board'
import { BoardProvider } from '@/features/board/components/board-context'

type Props = {
  teamId: string | null
  boardId: string | null
}

export function BoardContainer({ teamId, boardId }: Props) {
  if (!teamId) {
    return <div>Please select a team to view the board.</div>
  }

  if (!boardId) {
    return <div>Please select a board to view its contents.</div>
  }

  return (
    <BoardProvider>
      <Board boardId={boardId} teamId={teamId} />
    </BoardProvider>
  )
}
