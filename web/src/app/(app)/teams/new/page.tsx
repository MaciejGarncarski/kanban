import { NewTeamForm } from '@/features/new-team/components/new-team-form'
import { Title } from '@mantine/core'

export default function NewTeamPage() {
  return (
    <main>
      <Title order={1}>Create New Team</Title>
      <NewTeamForm />
    </main>
  )
}
