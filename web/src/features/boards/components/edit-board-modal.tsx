'use client'

import { useBoardById } from '@/features/boards/hooks/use-board-by-id'
import { useUpdateBoard } from '@/features/boards/hooks/use-update-board'
import { Button, Group, Modal, Stack, Textarea, TextInput } from '@mantine/core'
import { useForm } from '@mantine/form'

type Props = {
  isOpen: boolean
  onClose: () => void
  readableBoardId: string
}

export function EditBoardModal({ isOpen, onClose, readableBoardId }: Props) {
  const { data: boardData } = useBoardById({ readableBoardId })
  const { mutate, isPending } = useUpdateBoard()
  const form = useForm({
    initialValues: {
      name: boardData?.name || '',
      description: boardData?.description || '',
    },
  })

  if (!boardData) {
    return null
  }

  const handleSubmit = form.onSubmit((values) => {
    mutate(
      {
        body: { description: values.description, name: values.name },
        params: {
          path: {
            readableBoardId,
          },
        },
      },
      {
        onSuccess: () => {
          onClose()
        },
      },
    )
  })

  return (
    <Modal
      centered
      opened={isOpen}
      onClose={onClose}
      title="Update Board"
      radius={'md'}>
      <form onSubmit={handleSubmit}>
        <Stack gap={'md'}>
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
        </Stack>
        <Group mt="xl" justify="space-between">
          <Button type="reset" onClick={form.reset} color="red" radius={'md'}>
            Reset form
          </Button>
          <Button type="submit" loading={isPending} radius={'md'}>
            Save
          </Button>
        </Group>
      </form>
    </Modal>
  )
}
