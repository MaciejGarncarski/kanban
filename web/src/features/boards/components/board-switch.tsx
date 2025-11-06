import { BoardSwitchCombobox } from '@/features/boards/components/board-switch-combobox'
import { BoardSwitchPlaceholder } from '@/features/boards/components/board-switch-placeholder'
import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

type Props = {
  readableTeamId: string
  readableBoardId: string | null
}

export function BoardSwitch({ readableTeamId, readableBoardId }: Props) {
  return (
    <Suspense fallback={<BoardSwitchPlaceholder />}>
      <ErrorBoundary fallback={<BoardSwitchPlaceholder />}>
        <BoardSwitchCombobox
          readableTeamId={readableTeamId}
          readableBoardId={readableBoardId}
        />
      </ErrorBoundary>
    </Suspense>
  )
}
