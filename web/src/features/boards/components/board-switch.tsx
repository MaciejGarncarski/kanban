import { BoardSwitchCombobox } from '@/features/boards/components/board-switch-combobox'
import { BoardSwitchPlaceholder } from '@/features/boards/components/board-switch-placeholder'
import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

type Props = {
  teamId: string
  boardId: string | null
}

export function BoardSwitch({ teamId, boardId }: Props) {
  return (
    <Suspense fallback={<BoardSwitchPlaceholder />}>
      <ErrorBoundary fallback={<BoardSwitchPlaceholder />}>
        <BoardSwitchCombobox teamId={teamId} boardId={boardId} />
      </ErrorBoundary>
    </Suspense>
  )
}
