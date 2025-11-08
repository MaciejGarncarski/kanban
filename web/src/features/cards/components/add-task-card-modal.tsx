'use client'

import {
  Button,
  CheckIcon,
  Combobox,
  Flex,
  Group,
  Input,
  InputBase,
  Modal,
  Portal,
  Textarea,
  TextInput,
  useCombobox,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { useDisclosure } from '@mantine/hooks'
import { Plus } from 'lucide-react'
import { DateTimePicker } from '@mantine/dates'
import { useTeamUsers } from '@/features/teams/hooks/use-team-users'
import { useCreateCard } from '@/features/cards/hooks/use-create-card'
import { motion } from 'motion/react'

type Props = {
  readableTeamId: string
  columnId: string
}

export function AddTaskCardModal({ readableTeamId, columnId }: Props) {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  })
  const { mutate, isPending } = useCreateCard()
  const { data } = useTeamUsers({ readableTeamId })

  const [opened, { open, close }] = useDisclosure(false)
  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      name: '',
      description: '',
      dueDate: '',
      assignedTo: '',
    },
    validate: {
      description: (value) =>
        value.length <= 500 ? null : 'Max length is 500 characters',
      name: (value) =>
        value.length > 0 && value.length <= 32
          ? null
          : 'Name must be between 1 and 32 characters',
    },
  })

  const onSubmit = form.onSubmit(async (values) => {
    mutate(
      {
        body: {
          title: values.name,
          description:
            values.description.trim() === ''
              ? undefined
              : values.description.trim(),
          columnId: columnId,
          assignedTo:
            values.assignedTo.trim() === ''
              ? undefined
              : values.assignedTo.trim(),
          dueDate: values.dueDate ? values.dueDate : undefined,
        },
      },
      {
        onSuccess: async () => {
          close()
          form.reset()
        },
      },
    )
  })

  const selectedUserData = data.users.find(
    (user) => user.id === form.values.assignedTo,
  )
  const selectedUser = selectedUserData ? selectedUserData.name : null

  return (
    <>
      <Portal>
        <Modal opened={opened} onClose={close} title="Add task" centered>
          <form onSubmit={onSubmit} style={{ width: '100%' }}>
            <Flex direction="column" gap="lg">
              <TextInput
                withAsterisk
                label="Task Name"
                placeholder="Name of the task"
                type="text"
                key={form.key('name')}
                {...form.getInputProps('name')}
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

                    if (form.values.assignedTo === val) {
                      form.setFieldValue('assignedTo', '')
                      return
                    }

                    form.setFieldValue('assignedTo', val)
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
                            {user.id === form.values.assignedTo && (
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

              <Button loading={isPending} type="submit" mt="md">
                Create Task
              </Button>
            </Flex>
          </form>
        </Modal>
      </Portal>

      <motion.div layout style={{ width: '100%' }}>
        <Button
          variant="light"
          onClick={open}
          radius="md"
          size="sm"
          leftSection={<Plus size={16} />}>
          Add Task
        </Button>
      </motion.div>
    </>
  )
}
