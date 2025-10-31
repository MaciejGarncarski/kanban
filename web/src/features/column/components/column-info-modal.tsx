import { appQuery } from '@/api-client/api-client'
import { ActionIcon, Button, Group, Modal, TextInput } from '@mantine/core'
import { useForm } from '@mantine/form'
import { useDisclosure } from '@mantine/hooks'
import { CheckIcon, EditIcon, InfoIcon, TrashIcon, XIcon } from 'lucide-react'
import { useState } from 'react'

export function ColumnInfoModal({
  name,
  createdAt,
  teamId,
  columnId,
}: {
  columnId: string
  name: string
  createdAt: string
  teamId: string
}) {
  const [isEditing, setIsEditing] = useState(false)

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      name: name,
    },
    validate: {
      name: (value) => (value.trim().length > 0 ? null : 'Name is required'),
    },
  })

  const mutateColumn = appQuery.useMutation('patch', '/v1/columns/{columnId}', {
    onSuccess: (_, __, ___, ctx) => {
      ctx.client.invalidateQueries({
        queryKey: ['get', `/v1/boards/{teamId}/boards`],
      })
      ctx.client.invalidateQueries({
        queryKey: ['get', '/v1/boards/{boardId}'],
      })
      form.reset()
      setIsEditing(false)
    },
  })

  const deleteColumn = appQuery.useMutation(
    'delete',
    '/v1/columns/{columnId}',
    {
      onSuccess: (_, __, ___, ctx) => {
        ctx.client.invalidateQueries({
          queryKey: ['get', `/v1/boards/{teamId}/boards`],
        })
        ctx.client.invalidateQueries({
          queryKey: ['get', '/v1/boards/{boardId}'],
        })
      },
    },
  )

  const [opened, { open, close }] = useDisclosure(false, {
    onClose: () => {
      setTimeout(() => {
        setIsEditing(false)
        form.reset()
      }, 1000)
    },
  })

  const { data } = appQuery.useSuspenseQuery('get', '/v1/user/{teamId}/role', {
    params: { path: { teamId } },
  })

  const handleSave = form.onSubmit((values) => {
    mutateColumn.mutate({
      params: {
        path: {
          columnId: columnId,
        },
      },
      body: {
        name: values.name.trim() === '' ? undefined : values.name.trim(),
        position: undefined,
      },
    })
  })

  const isAdmin = data.role === 'admin'

  const handleDelete = () => {
    deleteColumn.mutate({
      params: {
        path: {
          columnId,
        },
      },
    })
  }

  return (
    <>
      <Modal opened={opened} onClose={close} title="Column Info" centered>
        {isEditing ? (
          <form onSubmit={handleSave}>
            <TextInput
              withAsterisk
              label="Column Name"
              placeholder="Name of the column"
              type="text"
              key={form.key('name')}
              {...form.getInputProps('name')}
            />
            <Group justify="space-between">
              <Button
                mt="md"
                bg="red"
                onClick={() => {
                  setIsEditing(false)
                  form.reset()
                }}
                leftSection={<XIcon size={20} />}>
                Cancel
              </Button>
              <Button
                mt="md"
                leftSection={<CheckIcon size={20} />}
                type="submit">
                Save
              </Button>
            </Group>
          </form>
        ) : (
          <>
            <div>
              <strong>Name:</strong> {name}
            </div>
            <div>
              <strong>Created At:</strong> {createdAt}
            </div>
            {isAdmin && (
              <Group justify="space-between" mt="md">
                <Button
                  mt="md"
                  onClick={() => setIsEditing(true)}
                  leftSection={<EditIcon size={20} />}>
                  Edit
                </Button>
                <Button
                  mt="md"
                  color="red"
                  loading={deleteColumn.isPending}
                  onClick={handleDelete}
                  leftSection={<TrashIcon size={20} />}>
                  Delete
                </Button>
              </Group>
            )}
          </>
        )}
      </Modal>

      <ActionIcon variant="light" onClick={open}>
        <InfoIcon size="70%" />
      </ActionIcon>
    </>
  )
}
