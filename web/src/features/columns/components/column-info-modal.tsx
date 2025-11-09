import { useDeleteColumn } from '@/features/columns/hooks/use-delete-column'
import { useUpdateColumn } from '@/features/columns/hooks/use-update-column'
import { useRoleByTeamId } from '@/features/teams/hooks/use-role-by-team-id'
import {
  ActionIcon,
  Button,
  Group,
  Modal,
  Text,
  TextInput,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { useDisclosure } from '@mantine/hooks'
import { CheckIcon, EditIcon, MenuIcon, TrashIcon, XIcon } from 'lucide-react'
import { useState } from 'react'

export function ColumnInfoModal({
  name,
  createdAt,
  readableTeamId,
  columnId,
}: {
  columnId: string
  name: string
  createdAt: string
  readableTeamId: string
}) {
  const [isEditing, setIsEditing] = useState(false)
  const deleteColumn = useDeleteColumn()
  const mutateColumn = useUpdateColumn()
  const { isAdmin } = useRoleByTeamId(readableTeamId)
  const [opened, { open, close }] = useDisclosure(false, {
    onClose: () => {
      setTimeout(() => {
        setIsEditing(false)
        form.reset()
      }, 1000)
    },
  })

  const [deleteOpened, { open: openDelete, close: closeDelete }] =
    useDisclosure(false)

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      name: name,
    },
    validate: {
      name: (value) => (value.trim().length > 0 ? null : 'Name is required'),
    },
  })

  const handleSave = form.onSubmit((values) => {
    mutateColumn.mutate(
      {
        params: {
          path: {
            columnId: columnId,
          },
        },
        body: {
          name: values.name.trim() === '' ? undefined : values.name.trim(),
          position: undefined,
        },
      },
      {
        onSuccess: () => {
          form.reset()
          setIsEditing(false)
        },
      },
    )
  })

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
      <Modal
        opened={opened}
        onClose={close}
        title="Column Info"
        centered
        radius={'md'}>
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
            <Group justify="space-between" mt="md">
              <Button
                mt="md"
                bg="red"
                radius="md"
                onClick={() => {
                  setIsEditing(false)
                  form.reset()
                }}
                leftSection={<XIcon size={20} />}>
                Cancel
              </Button>
              <Button
                radius="md"
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
              <strong>Created At:</strong>{' '}
              {new Date(createdAt).toLocaleString()}
            </div>
            {isAdmin && (
              <Group justify="space-between" mt="md">
                <Button
                  mt="md"
                  radius={'md'}
                  onClick={() => setIsEditing(true)}
                  leftSection={<EditIcon size={20} />}>
                  Edit
                </Button>
                <Button
                  mt="md"
                  color="red"
                  radius={'md'}
                  onClick={openDelete}
                  leftSection={<TrashIcon size={20} />}>
                  Delete
                </Button>
              </Group>
            )}
          </>
        )}
      </Modal>

      <Modal
        opened={deleteOpened}
        onClose={closeDelete}
        title="Delete Column"
        centered
        radius={'md'}>
        <Text>
          Are you sure you want to delete the column? This action cannot be
          undone.
        </Text>
        <div>
          <Button
            mt="md"
            ml="auto"
            color="red"
            radius={'md'}
            onClick={handleDelete}
            loading={deleteColumn.isPending}
            leftSection={<TrashIcon size={20} />}>
            Delete
          </Button>
        </div>
      </Modal>

      <ActionIcon variant="light" onClick={open}>
        <MenuIcon size="70%" />
      </ActionIcon>
    </>
  )
}
