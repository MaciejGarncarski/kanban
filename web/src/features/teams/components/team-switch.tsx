import { TeamSwitchCombobox } from '@/features/teams/components/team-switch-combobox'
import { TeamSwitchPlaceholder } from '@/features/teams/components/team-switch-placeholder'
import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

type Props = {
  teamId: string
}

export function TeamSwitch({ teamId }: Props) {
  return (
    <Suspense fallback={<TeamSwitchPlaceholder />}>
      <ErrorBoundary fallback={<TeamSwitchPlaceholder />}>
        <TeamSwitchCombobox teamId={teamId} />
      </ErrorBoundary>
    </Suspense>
  )
}
