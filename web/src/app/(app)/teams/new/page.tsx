import { BackToTeamsLink } from '@/features/layout/components/back-to-teams-link'
import { NewTeamForm } from '@/features/new-team/components/new-team-form'
import { Container, Stack, Title } from '@mantine/core'

export default function NewTeamPage() {
  return (
    <main>
      <Container size={'sm'} py="md">
        <Stack gap="md" justify="flex-start">
          <BackToTeamsLink />
          <Title order={1}>Create New Team</Title>
          <NewTeamForm />
        </Stack>
      </Container>
    </main>
  )
}
