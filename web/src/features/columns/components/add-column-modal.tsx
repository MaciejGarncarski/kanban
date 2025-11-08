import { useCreateColumn } from '@/features/columns/hooks/use-create-column'
import { Button, Flex, Modal, TextInput } from '@mantine/core'
import { useForm } from '@mantine/form'
import { useDisclosure } from '@mantine/hooks'
import { Plus } from 'lucide-react'

export function AddColumnModal({
  readableBoardId,
}: {
  readableBoardId: string
}) {
  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      name: '',
    },
    validate: {
      name: (value) => (value.trim().length > 0 ? null : 'Name is required'),
    },
  })
  const [opened, { open, close }] = useDisclosure(false)
  const { mutate, isPending } = useCreateColumn()

  const onSubmit = form.onSubmit(async (values) => {
    mutate(
      {
        body: { readableBoardId, title: values.name },
      },
      {
        onSuccess: () => {
          close()
        },

        onSettled: () => {
          form.reset()
        },
      },
    )
  })

  return (
    <>
      <Modal opened={opened} onClose={close} title="Add column" centered>
        <form onSubmit={onSubmit} style={{ width: '100%' }}>
          <Flex direction="column" gap="lg">
            <TextInput
              withAsterisk
              label="Column Name"
              placeholder="Todo.. In Progress.."
              type="text"
              key={form.key('name')}
              {...form.getInputProps('name')}
            />
            <Button loading={isPending} type="submit" mt="md">
              Create Column
            </Button>
          </Flex>
        </form>
      </Modal>

      <Button onClick={open} radius="md" leftSection={<Plus size={20} />}>
        Add Column
      </Button>
    </>
  )
}
