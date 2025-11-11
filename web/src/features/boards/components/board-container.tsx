'use client'

import { Board } from '@/features/boards/components/board'
import { BoardProvider } from '@/features/boards/components/board-context'
import { useBoardById } from '@/features/boards/hooks/use-board-by-id'
import { useBoardNotifications } from '@/features/boards/hooks/use-board-notifications'

type Props = {
  readableTeamId: string | null
  readableBoardId: string | null
}

export function BoardContainer({ readableTeamId, readableBoardId }: Props) {
  useBoardNotifications({})
  const { data: boardData } = useBoardById({
    readableBoardId: readableBoardId ?? '',
  })

  if (!readableTeamId) {
    return <div>Please select a team to view the board.</div>
  }

  if (!readableBoardId) {
    return <div>Please select a board to view its contents.</div>
  }

  if (!boardData) {
    return <div>Board not found.</div>
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
