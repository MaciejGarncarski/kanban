'use client'

import { Board } from '@/features/boards/components/board'
import { BoardProvider } from '@/features/boards/components/board-context'

type Props = {
  readableTeamId: string | null
  readableBoardId: string | null
}

export function BoardContainer({ readableTeamId, readableBoardId }: Props) {
  if (!readableTeamId) {
    return <div>Please select a team to view the board.</div>
  }

  if (!readableBoardId) {
    return <div>Please select a board to view its contents.</div>
  }

  return (
    <BoardProvider>
      <Board
        readableBoardId={readableBoardId}
        readableTeamId={readableTeamId}
      />
    </BoardProvider>
  )
}
