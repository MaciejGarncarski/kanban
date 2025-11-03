'use client'

import { appQuery } from '@/api-client/api-client'
import {
  Button,
  CheckIcon,
  Combobox,
  Group,
  Input,
  InputBase,
  Modal,
  Stack,
  Text,
  Textarea,
  TextInput,
  useCombobox,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { useState } from 'react'

type Props = {
  isOpen: boolean
  onClose: () => void
  teamId: string
}

export function EditTeamModal({ isOpen, onClose, teamId }: Props) {
  const { data: allTeams } = appQuery.useSuspenseQuery('get', '/v1/teams')
  const { data: teamUsers } = appQuery.useSuspenseQuery(
    'get',
    `/v1/teams/{teamId}/users`,
    { params: { path: { teamId } } },
  )
  const { data: userData } = appQuery.useSuspenseQuery('get', '/v1/auth/me')

  const currentTeam = allTeams.teams.find((team) => team.readableId === teamId)

  const defaultUserIds = teamUsers.users
    .map((user) => user.id)
    .filter((id) => id !== userData.id)

  const [selectedUsers, setSelectedUsers] = useState<string[]>(defaultUserIds)

  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  })

  const { mutate, isPending } = appQuery.useMutation(
    'patch',
    `/v1/teams/{teamId}`,
    {
      onSuccess: (_, __, ___, { client }) => {
        onClose()
        client.invalidateQueries({ queryKey: ['get', '/v1/teams'] })
      },
      onError: (error) => {
        notifications.show({
          title: 'Error',
          message: error.message,
          color: 'red',
        })
      },
    },
  )

  const form = useForm({
    initialValues: {
      name: currentTeam?.name || '',
      description: currentTeam?.description || '',
    },
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

  if (!allTeams) {
    return null
  }

  const handleSubmit = form.onSubmit(({ name, description }) => {
    mutate({
      body: {
        name,
        description: description,
        members: [...selectedUsers, userData.id],
      },
      params: { path: { teamId } },
    })
  })

  return (
    <Modal centered opened={isOpen} onClose={onClose} title="Edit Team">
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
        </Stack>
        <Group mt="xl" justify="space-between">
          <Button onClick={form.reset}>Reset form</Button>
          <Button loading={isPending} type="submit">
            Save
          </Button>
        </Group>
      </form>
    </Modal>
  )
}
