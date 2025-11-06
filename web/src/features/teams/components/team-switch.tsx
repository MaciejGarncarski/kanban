import { TeamSwitchCombobox } from '@/features/teams/components/team-switch-combobox'
import { TeamSwitchPlaceholder } from '@/features/teams/components/team-switch-placeholder'
import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

type Props = {
  readableTeamId: string
}

export function TeamSwitch({ readableTeamId }: Props) {
  return (
    <Suspense fallback={<TeamSwitchPlaceholder />}>
      <ErrorBoundary fallback={<TeamSwitchPlaceholder />}>
        <TeamSwitchCombobox readableTeamId={readableTeamId} />
      </ErrorBoundary>
    </Suspense>
  )
}
