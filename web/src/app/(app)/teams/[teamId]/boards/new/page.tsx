import { READABLE_ID_LENGTH } from '@/constants/column'
import { CreateBoardForm } from '@/features/boards/components/create-board-form'
import { Title } from '@mantine/core'
import * as z from 'zod/v4'

const paramsSchema = z.object({
  teamId: z.string().length(READABLE_ID_LENGTH),
})

export default async function NewBoardPage({
  params,
}: PageProps<'/teams/[teamId]/boards/new'>) {
  const awaitedParams = await params

  const { data, error } = paramsSchema.safeParse(awaitedParams)

  if (!data) {
    return <div>Invalid parameters: {error?.message}</div>
  }

  return (
    <main>
      <Title order={1}>Create New Board</Title>
      <CreateBoardForm teamId={data.teamId} />
    </main>
  )
}
