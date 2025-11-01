import { appQuery } from '@/api-client/api-client'
import { Button, Flex, Modal, TextInput } from '@mantine/core'
import { useForm } from '@mantine/form'
import { useDisclosure } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import { Plus } from 'lucide-react'

export function AddColumnModal({ boardId }: { boardId: string }) {
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
  const { mutate, isPending } = appQuery.useMutation('post', '/v1/columns')

  const onSubmit = form.onSubmit(async (values) => {
    mutate(
      {
        body: { boardId, title: values.name },
      },
      {
        onSuccess: (_, __, ___, ctx) => {
          ctx.client.invalidateQueries({
            queryKey: ['get', '/v1/boards/{boardId}'],
          })
          notifications.show({
            title: 'Success',
            message: 'Column created successfully',
            color: 'green',
          })
          close()
        },
        onError: (error) => {
          notifications.show({
            title: 'Error',
            message: error.message || 'Failed to create column',
            color: 'red',
          })
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

      <Button variant="filled" onClick={open}>
        <Plus /> Add Column
      </Button>
    </>
  )
}
