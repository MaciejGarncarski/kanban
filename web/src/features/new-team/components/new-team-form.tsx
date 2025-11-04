'use client'

import { useAuth } from '@/features/auth/hooks/use-auth'
import { useCreateTeam } from '@/features/teams/hooks/use-create-team'
import { useAllUsers } from '@/features/users/hooks/use-all-users'
import {
  Button,
  CheckIcon,
  Combobox,
  Flex,
  Group,
  Input,
  InputBase,
  Stack,
  Text,
  Textarea,
  TextInput,
  useCombobox,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { useState } from 'react'

export function NewTeamForm() {
  const { data: allUsersData } = useAllUsers()
  const { data: userData } = useAuth()
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])

  const form = useForm({
    initialValues: {
      name: '',
      description: '',
    },
    validate: {
      name: (value) => (value.length < 1 ? 'Name is required' : null),
    },
  })

  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  })

  const newTeamMutation = useCreateTeam()

  const handleSubmit = form.onSubmit((values) => {
    newTeamMutation.mutate({
      body: {
        name: values.name,
        description: values.description,
        members: selectedUsers || [],
      },
    })
  })

  const filteredUsers = allUsersData.users.filter(
    (user) => user.id !== userData.id,
  )

  const selectedUserNames = selectedUsers
    .map((id) => {
      const user = filteredUsers.find((user) => user.id === id)
      return user ? user.name : 'Unknown User'
    })
    .join(', ')

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

        <Input.Wrapper label="Team users">
          <Combobox
            store={combobox}
            onOptionSubmit={(val) => {
              if (selectedUsers.includes(val)) {
                setSelectedUsers((prev) => prev.filter((id) => id !== val))
                return
              }

              setSelectedUsers((prev) => [...prev, val])
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
                {selectedUsers.length > 0 ? (
                  <Group>
                    <Text>{selectedUserNames}</Text>
                  </Group>
                ) : (
                  <Input.Placeholder>Select users</Input.Placeholder>
                )}
              </InputBase>
            </Combobox.Target>
            <Combobox.Dropdown>
              <Combobox.Options>
                {filteredUsers.map((user) => (
                  <Combobox.Option key={user.id} value={user.id}>
                    <Group>
                      {selectedUsers.includes(user.id) && (
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

        <Flex>
          <Button type="submit" ml="auto">
            Create Team
          </Button>
        </Flex>
      </Stack>
    </form>
  )
}
