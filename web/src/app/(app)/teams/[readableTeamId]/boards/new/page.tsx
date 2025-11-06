import { READABLE_ID_LENGTH } from '@/constants/column'
import { CreateBoardForm } from '@/features/boards/components/create-board-form'
import { BackToTeamsLink } from '@/features/layout/components/back-to-teams-link'
import { Container, Stack, Title } from '@mantine/core'
import * as z from 'zod/v4'

const paramsSchema = z.object({
  readableTeamId: z.string().length(READABLE_ID_LENGTH),
})

export default async function NewBoardPage({
  params,
}: PageProps<'/teams/[readableTeamId]/boards/new'>) {
  const awaitedParams = await params

  const { data, error } = paramsSchema.safeParse(awaitedParams)

  if (!data) {
    return <div>Invalid parameters: {error?.message}</div>
  }

  return (
    <main>
      <Container size="sm" py="md">
        <Stack gap="md" justify="flex-start">
          <BackToTeamsLink />
          <Title order={1}>Create New Board</Title>
          <CreateBoardForm readableTeamId={data.readableTeamId} />
        </Stack>
      </Container>
    </main>
  )
}
