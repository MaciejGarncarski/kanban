import { useUpdateCard } from '@/features/cards/hooks/use-update-card'
import { useTeamUsers } from '@/features/teams/hooks/use-team-users'
import {
  Button,
  CheckIcon,
  Combobox,
  Group,
  Input,
  InputBase,
  Modal,
  Stack,
  Textarea,
  TextInput,
  useCombobox,
} from '@mantine/core'
import { DateTimePicker } from '@mantine/dates'
import { useForm } from '@mantine/form'
import { useDisclosure } from '@mantine/hooks'
import { EditIcon } from 'lucide-react'

type Props = {
  readableTeamId: string
  cardId: string
  title: string
  description?: string
  dueDate?: Date | null
  assignedToId?: string
}

export function EditTaskModal({
  cardId,
  readableTeamId,
  title,
  description,
  dueDate,
  assignedToId,
}: Props) {
  const mutateTask = useUpdateCard()
  const [opened, { open, close }] = useDisclosure(false)
  const form = useForm({
    initialValues: {
      title: title,
      description: description || '',
      dueDate: dueDate?.toISOString() || null,
      assignedToId: assignedToId || '',
    },
    validate: {
      title: (value) =>
        value.length > 0 && value.length <= 32
          ? null
          : 'Title must be between 1 and 32 characters',
      description: (value) =>
        value.length <= 500 ? null : 'Description is too long',
    },
  })

  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  })

  const { data } = useTeamUsers({ readableTeamId })

  const selectedUserData = data.users.find(
    (user) => user.id === form.values.assignedToId,
  )
  const selectedUser = selectedUserData ? selectedUserData.name : null

  const handleSubmit = form.onSubmit((values) => {
    mutateTask.mutate(
      {
        params: {
          path: { cardId },
        },
        body: {
          title: values.title,
          description:
            values.description.trim() === ''
              ? undefined
              : values.description.trim(),
          dueDate: values.dueDate ? values.dueDate : undefined,
          assignedTo: values.assignedToId || undefined,
        },
      },
      {
        onSuccess: () => {
          close()
          form.reset()
        },
      },
    )
  })

  return (
    <>
      <Button mt="md" onClick={open} leftSection={<EditIcon size={20} />}>
        Edit
      </Button>

      <Modal
        opened={opened}
        onClose={close}
        title="Edit Task"
        centered
        radius={'md'}>
        <form onSubmit={handleSubmit}>
          <Stack gap="lg">
            <TextInput
              label="Title"
              required
              {...form.getInputProps('title')}
            />
            <Textarea
              label="Task Description"
              placeholder="Description of the task"
              key={form.key('description')}
              {...form.getInputProps('description')}
            />
            <Input.Wrapper label="Assigned To">
              <Combobox
                store={combobox}
                onOptionSubmit={(val) => {
                  combobox.closeDropdown()

                  if (form.values.assignedToId === val) {
                    form.setFieldValue('assignedToId', '')
                    return
                  }

                  form.setFieldValue('assignedToId', val)
                }}>
                <Combobox.Target>
                  <InputBase
                    component="button"
                    type="button"
                    pointer
                    w="100%"
                    rightSection={<Combobox.Chevron />}
                    rightSectionPointerEvents="none"
                    onClick={() => combobox.toggleDropdown()}>
                    {selectedUser ? (
                      <span>{selectedUser}</span>
                    ) : (
                      <Input.Placeholder>Select user</Input.Placeholder>
                    )}
                  </InputBase>
                </Combobox.Target>
                <Combobox.Dropdown>
                  <Combobox.Options>
                    {data.users.map((user) => (
                      <Combobox.Option key={user.id} value={user.id}>
                        <Group>
                          {user.id === form.values.assignedToId && (
                            <CheckIcon size={12} />
                          )}
                          {user.name} - {user.email}
                        </Group>
                      </Combobox.Option>
                    ))}
                  </Combobox.Options>
                </Combobox.Dropdown>
              </Combobox>
            </Input.Wrapper>

            <DateTimePicker
              label="Due Date"
              placeholder="Date and time"
              key={form.key('dueDate')}
              {...form.getInputProps('dueDate')}
            />

            <Group mt="xl" justify="space-between">
              <Button
                type="reset"
                bg="cyan"
                onClick={() => form.reset()}
                disabled={mutateTask.isPending}>
                Reset form
              </Button>
              <Button
                type="submit"
                disabled={mutateTask.isPending}
                loading={mutateTask.isPending}>
                Save Changes
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </>
  )
}
