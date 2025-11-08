'use client'

import { useCreateBoard } from '@/features/boards/hooks/use-create-board'
import { Button, Stack, Textarea, TextInput } from '@mantine/core'
import { useForm } from '@mantine/form'

type Props = {
  readableTeamId: string
}

export function CreateBoardForm({ readableTeamId }: Props) {
  const { mutate, isPending } = useCreateBoard({ readableTeamId })
  const form = useForm({
    initialValues: {
      name: '',
      description: '',
    },
  })

  const handleSubmit = form.onSubmit((values) => {
    mutate({
      body: {
        name: values.name,
        description: values.description,
        readableTeamId: readableTeamId,
      },
    })
  })

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="xl">
        <TextInput
          label="Team Name"
          placeholder="Enter team name"
          required
          type="text"
          key={form.key('name')}
          {...form.getInputProps('name')}
        />
        <Textarea
          label="Description"
          placeholder="Enter team description"
          key={form.key('description')}
          {...form.getInputProps('description')}
        />

        <Button type="submit" loading={isPending} radius="md" ml="auto">
          Create Board
        </Button>
      </Stack>
    </form>
  )
}
