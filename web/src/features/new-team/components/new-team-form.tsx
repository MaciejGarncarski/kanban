'use client'

import { appQuery } from '@/api-client/api-client'
import {
  Button,
  CheckIcon,
  Combobox,
  Container,
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
import { notifications } from '@mantine/notifications'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function NewTeamForm() {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const router = useRouter()

  const newTeamMutation = appQuery.useMutation('post', '/v1/teams', {
    onError: () => {
      notifications.show({
        title: 'Error',
        message: 'Failed to create team. Please try again.',
        color: 'red',
      })
    },
    onSuccess: (data) => {
      if (data.readableId) {
        router.push(`/teams/${data.readableId}`)
      }
    },
  })

  const { data: userData } = appQuery.useSuspenseQuery('get', '/v1/auth/me')

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

  const handleSubmit = form.onSubmit((values) => {
    newTeamMutation.mutate({
      body: {
        name: values.name,
        description: values.description,
        members: selectedUsers || [],
      },
    })
  })

  const { data: allUsersData } = appQuery.useSuspenseQuery(
    'get',
    '/v1/user/all',
  )

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
    <Container size="sm" my="md">
      <form onSubmit={handleSubmit}>
        <Stack>
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
    </Container>
  )
}
